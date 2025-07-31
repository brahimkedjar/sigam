import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // adjust the path as needed

@Injectable()
export class CoordonneesService {
  constructor(private readonly prisma: PrismaService) {}

async createCoordonnees(
  id_proc: number,
  id_zone_interdite: number,
  points: {
    x: string;
    y: string;
    z: string;
    point?: string;
  }[],
  statut_coord: 'NOUVEAU' | 'ANCIENNE' | 'DEMANDE_INITIALE' = 'NOUVEAU'
) {
  try {
    const procedure = await this.prisma.procedure.findUnique({
      where: { id_proc },
      include: { typeProcedure: true },
    });

const libelle = procedure?.typeProcedure?.libelle?.toLowerCase() ?? '';
const isDemandeInitiale = libelle === 'demande';
const effectiveStatut = isDemandeInitiale ? 'DEMANDE_INITIALE' : (statut_coord ?? 'NOUVEAU');

    const createdCoords = await this.prisma.$transaction(async (tx) => {
      const coords = await Promise.all(points.map(p =>
        tx.coordonnee.create({
          data: {
            id_zone_interdite,
            x: parseFloat(p.x),
            y: parseFloat(p.y),
            z: parseFloat(p.z),
            point: JSON.stringify(p.point || { x: p.x, y: p.y, z: p.z }),
          }
        })
      ));

      await Promise.all(coords.map(coord =>
        tx.procedureCoord.create({
          data: {
            id_proc,
            id_coordonnees: coord.id_coordonnees,
            statut_coord: effectiveStatut,
          }
        })
      ));

      return coords;
    });

    return {
      message: 'Coordonnées liées à la procédure avec succès.',
      data: createdCoords,
    };
  } catch (error) {
    console.error('Erreur lors de la création des coordonnées:', error);
    throw new InternalServerErrorException('Erreur serveur lors de la sauvegarde.');
  }
}



  async getExistingPerimeters() {
  try {
    const raw = await this.prisma.procedureCoord.findMany({
      include: {
        procedure: {
          select: {
            id_proc: true,
            num_proc: true,
          },
        },
        coordonnee: true
      }
    });

    const grouped = raw.reduce((acc, entry) => {
      const id = entry.procedure.id_proc;
      const code = entry.procedure.num_proc;
      if (!acc[id]) {
        acc[id] = {
          id_proc: id,
          num_proc: code,
          coordinates: []
        };
      }
      acc[id].coordinates.push([entry.coordonnee.x, entry.coordonnee.y]);
      return acc;
    }, {} as Record<number, { id_proc: number; num_proc: string; coordinates: [number, number][] }>);

    return Object.values(grouped).map((poly) => {
      const { coordinates } = poly;
      if (
        coordinates.length >= 3 &&
        (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
         coordinates[0][1] !== coordinates[coordinates.length - 1][1])
      ) {
        coordinates.push(coordinates[0]);
      }
      return poly;
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des périmètres existants:', error);
    throw new InternalServerErrorException('Erreur serveur lors de la récupération.');
  }
}



async getCoordonneesByProcedure(id_proc: number) {
  return await this.prisma.procedureCoord.findMany({
    where: { id_proc },
    include: {
      coordonnee: true
    },
    orderBy: {
      id_coordonnees: 'asc'
    }
  });
}

async deleteCoordonneesByProcedure(id_proc: number) {
  // Step 1: Find all coord IDs linked to this procedure
  const links = await this.prisma.procedureCoord.findMany({
    where: { id_proc },
    select: { id_coordonnees: true }
  });

  const coordIds = links.map(link => link.id_coordonnees);

  // Step 2: Delete all procedureCoord links
  await this.prisma.procedureCoord.deleteMany({
    where: { id_proc }
  });

  // Step 3: Delete the coordonnee records
  return await this.prisma.coordonnee.deleteMany({
    where: { id_coordonnees: { in: coordIds } }
  });
}


async updateCoordonnees(
  id_proc: number,
  id_zone_interdite: number,
  points: { x: string; y: string; z: string; point?: string }[],
  statut_coord: 'DEMANDE_INITIALE' | 'NOUVEAU' | 'ANCIENNE' = 'NOUVEAU',
  superficie?: number
)
 {
  try {
    // STEP 1: Check if any coordinates already exist for this procedure
    const existingCoords = await this.prisma.procedureCoord.findMany({
      where: { id_proc },
      select: { id_coordonnees: true },
    });

    const coordIds = existingCoords.map((l) => l.id_coordonnees);

    // STEP 2: Determine the correct statut_coord if not provided
    const finalStatutCoord: 'DEMANDE_INITIALE' | 'NOUVEAU' | 'ANCIENNE' = 
      statut_coord ??
      (existingCoords.length === 0 ? 'DEMANDE_INITIALE' : 'NOUVEAU');

    // STEP 3: Delete existing links and coords (soft delete if you want history)
    if (coordIds.length > 0) {
      await this.prisma.procedureCoord.deleteMany({
        where: { id_proc },
      });

      await this.prisma.coordonnee.deleteMany({
        where: { id_coordonnees: { in: coordIds } },
      });
    }

    // STEP 4: Create new coords + link them
    const created = await this.prisma.$transaction(async (tx) => {
      const newCoords = await Promise.all(
        points.map((p) =>
          tx.coordonnee.create({
            data: {
              id_zone_interdite,
              x: parseFloat(p.x),
              y: parseFloat(p.y),
              z: parseFloat(p.z),
              point: JSON.stringify(p.point || { x: p.x, y: p.y, z: p.z }),
            },
          })
        )
      );

      await Promise.all(
        newCoords.map((coord) =>
          tx.procedureCoord.create({
            data: {
              id_proc,
              id_coordonnees: coord.id_coordonnees,
              statut_coord: finalStatutCoord,
            },
          })
        )
      );

      return newCoords;
    });

    // STEP 5: Optional update superficie
    if (superficie !== undefined) {
      await this.prisma.procedure.update({
        where: { id_proc },
        data: {
          observations: `Superficie mise à jour: ${superficie} m²`,
        },
      });
    }

    return {
      message: 'Coordonnées mises à jour avec succès.',
      data: created,
    };
  } catch (err) {
    console.error('Erreur update:', err);
    throw new InternalServerErrorException(
      'Erreur lors de la mise à jour des coordonnées.'
    );
  }
}



}
