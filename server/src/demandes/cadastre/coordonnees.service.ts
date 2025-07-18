import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // adjust the path as needed

@Injectable()
export class CoordonneesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCoordonnees(
    id_demande: number,
    id_zone_interdite: number,
    points: {
      x: string;
      y: string;
      z: string;
      point?: string;
    }[]
  ) {
    try {
      const created = await this.prisma.$transaction(
        points.map((p) =>
          this.prisma.coordonnee.create({
            data: {
              id_demande,
              id_zone_interdite,
              x: parseFloat(p.x),
              y: parseFloat(p.y),
              z: parseFloat(p.z),
              point: JSON.stringify(p.point || { x: p.x, y: p.y, z: p.z }),
            },
          }),
        ),
      );
      return {
        message: 'Coordonnées enregistrées avec succès.',
        data: created,
      };
    } catch (error) {
      console.error('Erreur lors de la création des coordonnées:', error);
      throw new InternalServerErrorException('Erreur serveur lors de la sauvegarde.');
    }
  }

  async getExistingPerimeters() {
  try {
    const raw = await this.prisma.coordonnee.findMany({
      include: {
        demande: {
          select: {
            id_demande: true,
            code_demande: true,
          }
        }
      }
    });

    const grouped = raw.reduce((acc, coord) => {
      const id = coord.demande.id_demande;
      const code = coord.demande.code_demande;
      if (!acc[id]) {
        acc[id] = {
          id_demande: id,
          code_demande: code,
          coordinates: []
        };
      }
      acc[id].coordinates.push([coord.x, coord.y]);
      return acc;
    }, {} as Record<number, { id_demande: number, code_demande: string, coordinates: [number, number][] }>);

    // Close the polygons
    const result = Object.values(grouped).map((poly) => {
      const { coordinates } = poly;
      if (
        coordinates.length >= 3 &&
        (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
         coordinates[0][1] !== coordinates[coordinates.length - 1][1])
      ) {
        coordinates.push(coordinates[0]); // Close the polygon
      }
      return poly;
    });

    return result;
  } catch (error) {
    console.error('Erreur lors de la récupération des périmètres existants:', error);
    throw new InternalServerErrorException('Erreur serveur lors de la récupération.');
  }
}


async getCoordonneesByDemande(id_demande: number) {
  return await this.prisma.coordonnee.findMany({
    where: { id_demande },
    orderBy: { id_coordonnees: 'asc' },
  });
}

async deleteCoordonneesByDemande(id_demande: number) {
  return await this.prisma.coordonnee.deleteMany({
    where: { id_demande },
  });
}

async updateCoordonnees(
  id_demande: number,
  id_zone_interdite: number,
  points: { x: string; y: string; z: string; point?: string }[],
  superficie?: number // ✅ Add superficie here
) {
  try {
    // Delete old coordinates
    await this.prisma.coordonnee.deleteMany({ where: { id_demande } });

    // Insert new coordinates
    const updatedCoords = await this.prisma.$transaction(
      points.map(p =>
        this.prisma.coordonnee.create({
          data: {
            id_demande,
            id_zone_interdite,
            x: parseFloat(p.x),
            y: parseFloat(p.y),
            z: parseFloat(p.z),
            point: JSON.stringify(p.point || { x: p.x, y: p.y, z: p.z }),
          },
        })
      )
    );

    // ✅ Update superficie in demande table if provided
    if (superficie !== undefined) {
      await this.prisma.demande.update({
        where: { id_demande },
        data: { superficie },
      });
    }

    return {
      message: 'Coordonnées et superficie mises à jour avec succès.',
      data: updatedCoords,
    };
  } catch (err) {
    console.error('Erreur update:', err);
    throw new InternalServerErrorException('Erreur lors de la mise à jour.');
  }
}





}
