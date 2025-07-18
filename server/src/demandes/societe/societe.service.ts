import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateActionnaireDto, ActionnaireResult } from '../dto/create-actionnaire.dto';
import { PersonnePhysique, FonctionPersonneMoral, RegistreCommerce, DetenteurMorale } from '@prisma/client';

@Injectable()
export class SocieteService {
  async createDetenteur(data: any) {
    const existing = await this.prisma.detenteurMorale.findFirst({
  where: {
    nom_sociétéFR: data.nom_fr,
    nom_sociétéAR: data.nom_ar,
    id_statutJuridique: data.statut_id,
  }
});

if (existing) {
    throw new HttpException('Le Detenteur Morale existe déjà.', HttpStatus.CONFLICT); // <-- send proper error
  }
  return this.prisma.detenteurMorale.create({
    data: {
      nom_sociétéFR: data.nom_fr,
      nom_sociétéAR: data.nom_ar,
      id_statutJuridique: data.statut_id,
      telephone: data.tel,
      email: data.email,
      fax: data.fax,
      adresse_siège: data.adresse,
      nationalité: data.nationalite ?? '',
      pay: data.pay ?? '', 
    },
  });
}

async updateRepresentant(nin: string, data: any) {
    // Find person by NIN
    const personne = await this.prisma.personnePhysique.findUnique({
      where: { num_carte_identité: nin }
    });

    if (!personne) {
      throw new HttpException('Personne non trouvée', HttpStatus.NOT_FOUND);
    }

    // Update person details
    const updatedPersonne = await this.prisma.personnePhysique.update({
      where: { id_personne: personne.id_personne },
      data: {
        nomFR: data.nom,
        prenomFR: data.prenom,
        nomAR: data.nom_ar,
        prenomAR: data.prenom_ar,
        telephone: data.tel,
        email: data.email,
        fax: data.fax,
        qualification: data.qualite,
        nationalité: data.nationalite,
        lieu_naissance: data.lieu_naissance,
      }
    });
    
    // Update or create the function
    await this.linkFonction(
      personne.id_personne,
      data.id_detenteur,
      'Représentant légal',
      'Actif',
      parseFloat(data.taux_participation)
    );

    return { personne: updatedPersonne };
  }

  async linkFonction(
    id_personne: number,
    id_detenteur: number,
    type_fonction: string,
    statut_personne: string,
    taux_participation: number
  ): Promise<FonctionPersonneMoral> {
    // Check if function exists
    const existing = await this.prisma.fonctionPersonneMoral.findFirst({
      where: {
        id_personne,
        id_detenteur,
        type_fonction
      }
    });

    if (existing) {
      // Update existing
      return this.prisma.fonctionPersonneMoral.update({
        where: {
          id_detenteur_id_personne: {
            id_detenteur,
            id_personne
          }
        },
        data: {
          statut_personne,
          taux_participation
        }
      });
    }
    
    // Create new if not exists
    return this.prisma.fonctionPersonneMoral.create({
      data: {
        id_detenteur,
        id_personne,
        type_fonction,
        statut_personne,
        taux_participation
      }
    });
  }


 async createRegistre(id_detenteur: number, data: any) {
  if (!data.numero_rc || !data.date_enregistrement || !data.capital_social || !data.nis || !data.nif) {
    throw new HttpException('Tous les champs requis doivent être fournis.', HttpStatus.BAD_REQUEST);
  }

  const existing = await this.prisma.registreCommerce.findFirst({
    where: {
      numero_rc: data.numero_rc,
      nis: data.nis,
      nif: data.nif,
    }
  });

  if (existing) {
    throw new HttpException('Le Registre de Commerce existe déjà.', HttpStatus.CONFLICT);
  }

  const parsedDate = new Date(data.date_enregistrement);
  if (isNaN(parsedDate.getTime())) {
    throw new HttpException('Date d’enregistrement invalide.', HttpStatus.BAD_REQUEST);
  }

  const capital = parseFloat(data.capital_social);
  if (isNaN(capital)) {
    throw new HttpException('Capital social invalide.', HttpStatus.BAD_REQUEST);
  }

  return this.prisma.registreCommerce.create({
    data: {
      id_detenteur,
      numero_rc: data.numero_rc,
      date_enregistrement: parsedDate,
      capital_social: capital,
      nis: data.nis,
      adresse_legale: data.adresse_legale || '',
      nif: data.nif,
    },
  });
}


  constructor(private prisma: PrismaService) {}

  async createPersonne(data: any): Promise<PersonnePhysique> {
  const existing = await this.prisma.personnePhysique.findFirst({
    where: {
      nomFR: data.nom,
      prenomFR: data.prenom,
      num_carte_identité: data.nin,
    }
  });

if (existing) {
    throw new HttpException('Cette Personne Physique existe déjà.', HttpStatus.CONFLICT); // <-- send proper error
  }
  return this.prisma.personnePhysique.create({
    data: {
      nomFR: data.nom,
      prenomFR: data.prenom,
      nomAR: data.nom_ar ?? '',
      prenomAR: data.prenom_ar ?? '',
      telephone: data.tel ?? '',
      email: data.email ?? '',
      fax: data.fax ?? '',
      qualification: data.qualite,
      nationalité: data.nationalite,
      num_carte_identité: data.nin,
      pay: data.pay ?? '',
      adresse_domicile: '',
      date_naissance: new Date(),
      lieu_naissance: data.lieu_naissance ?? '',
      lieu_juridique_soc: '',
      réf_professionnelles: '',
    },
  });
}

async updateActionnaires(
    id_detenteur: number,
    list: CreateActionnaireDto[]
  ): Promise<ActionnaireResult[]> {
    // First delete actionnaires not in the new list
    const existingNins = list.map(a => a.numero_carte).filter(Boolean);
    await this.prisma.fonctionPersonneMoral.deleteMany({
      where: {
        id_detenteur,
        type_fonction: 'Actionnaire',
        NOT: {
          personne: {
            num_carte_identité: {
              in: existingNins
            }
          }
        }
      }
    });

    const results: ActionnaireResult[] = [];
    for (const a of list) {
      let personne: PersonnePhysique;
      const existingPersonne = await this.prisma.personnePhysique.findFirst({
        where: { num_carte_identité: a.numero_carte }
      });

      if (existingPersonne) {
        // Update existing person
        personne = await this.prisma.personnePhysique.update({
          where: { id_personne: existingPersonne.id_personne },
          data: {
            nomFR: a.nom,
            prenomFR: a.prenom,
            qualification: a.qualification,
            nationalité: a.nationalite,
            lieu_naissance: a.lieu_naissance
          }
        });
      } else {
        // Create new person
        personne = await this.createPersonne({
          nom: a.nom,
          prenom: a.prenom,
          nom_ar: '',
          prenom_ar: '',
          tel: '',
          email: '',
          fax: '',
          qualite: a.qualification,
          nationalite: a.nationalite,
          nin: a.numero_carte,
          lieu_naissance: a.lieu_naissance,
        });
      }

      // Link/update as actionnaire
      const lien = await this.linkFonction(
        personne.id_personne,
        id_detenteur,
        'Actionnaire',
        'Actif',
        parseFloat(a.taux_participation)
      );

      results.push({ personne, lien });
    }
    return results;
  }

  async updateRegistre(id_detenteur: number, data: any): Promise<RegistreCommerce> {
  // First check if registre exists
  const existing = await this.prisma.registreCommerce.findUnique({
    where: { id_detenteur }
  });

  if (!existing) {
    throw new HttpException('Registre de Commerce non trouvé', HttpStatus.NOT_FOUND);
  }

  return this.prisma.registreCommerce.update({
    where: { id_detenteur },
    data: {
      numero_rc: data.numero_rc,
      date_enregistrement: new Date(data.date_enregistrement),
      capital_social: parseFloat(data.capital_social),
      nis: data.nis,
      adresse_legale: data.adresse_legale,
      nif: data.nif,
    }
  });
}

async updateDetenteur(id: number, data: any): Promise<DetenteurMorale> {
  // First check if detenteur exists
  const existing = await this.prisma.detenteurMorale.findUnique({
    where: { id_detenteur: id }
  });

  if (!existing) {
    throw new HttpException('Détenteur non trouvé', HttpStatus.NOT_FOUND);
  }

  // Check for conflicts with other detenteurs
  const conflictingDetenteur = await this.prisma.detenteurMorale.findFirst({
    where: {
      NOT: { id_detenteur: id },
      OR: [
        { nom_sociétéFR: data.nom_fr },
        { nom_sociétéAR: data.nom_ar }
      ]
    }
  });

  if (conflictingDetenteur) {
    throw new HttpException('Un détenteur avec ce nom existe déjà', HttpStatus.CONFLICT);
  }

  // Update the detenteur
  return this.prisma.detenteurMorale.update({
    where: { id_detenteur: id },
    data: {
      nom_sociétéFR: data.nom_fr,
      nom_sociétéAR: data.nom_ar,
      id_statutJuridique: data.statut_id,
      telephone: data.tel,
      email: data.email,
      fax: data.fax,
      adresse_siège: data.adresse,
      nationalité: data.nationalite,
      pay: data.pay
    }
  });
}

async deleteActionnaires(id_detenteur: number) {
  // Start transaction to ensure data consistency
  return this.prisma.$transaction(async (tx) => {
    // 1. Get all actionnaires with their person data
    const fonctions = await tx.fonctionPersonneMoral.findMany({
      where: {
        id_detenteur,
        type_fonction: 'Actionnaire'
      },
      include: {
        personne: true
      }
    });

    // 2. Delete all actionnaire functions
    await tx.fonctionPersonneMoral.deleteMany({
      where: {
        id_detenteur,
        type_fonction: 'Actionnaire'
      }
    });

    // 3. Delete orphaned persons (not used in other functions)
    for (const f of fonctions) {
      const otherFunctionsCount = await tx.fonctionPersonneMoral.count({
        where: {
          id_personne: f.id_personne,
          NOT: {
            id_detenteur,
            id_personne: f.id_personne
          }
        }
      });

      if (otherFunctionsCount === 0) {
        await tx.personnePhysique.delete({
          where: { id_personne: f.id_personne }
        });
      }
    }

    return { count: fonctions.length };
  });
}

  async createActionnaires(
  id_detenteur: number,
  list: CreateActionnaireDto[]
): Promise<ActionnaireResult[]> {
  const results: ActionnaireResult[] = [];

  for (const a of list) {
    // 1. Check if the person already exists
    const existingPersonne = await this.prisma.personnePhysique.findFirst({
      where: {
        nomFR: a.nom,
        prenomFR: a.prenom,
        num_carte_identité: a.numero_carte,
      },
    });

    let personne;

    if (existingPersonne) {
      // 2. Check if already linked to this detenteur as Actionnaire
      const existingLink = await this.prisma.fonctionPersonneMoral.findFirst({
        where: {
          id_personne: existingPersonne.id_personne,
          id_detenteur,
          type_fonction: 'Actionnaire',
        },
      });

      if (existingLink) {
        // 3. Throw HTTP Conflict
        throw new HttpException(
          `L'actionnaire "${a.nom} ${a.prenom}" existe déjà pour cette société.`,
          HttpStatus.CONFLICT
        );
      }

      personne = existingPersonne;
    } else {
      // Create new personne
      personne = await this.createPersonne({
        nom: a.nom,
        prenom: a.prenom,
        nom_ar: '',
        prenom_ar: '',
        tel: '',
        email: '',
        fax: '',
        qualite: a.qualification,
        nationalite: a.nationalite,
        nin: a.numero_carte,
        lieu_naissance: a.lieu_naissance,
      });
    }

    // Link as actionnaire
    const lien = await this.linkFonction(
      personne.id_personne,
      id_detenteur,
      'Actionnaire',
      'Actif',
      parseFloat(a.taux_participation)
    );

    results.push({ personne, lien });
  }

  return results;
}



}
