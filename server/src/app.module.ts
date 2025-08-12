import { Module } from '@nestjs/common';

import { DemandesModule } from './demandes/demande/demande.module';
import { DemandesController } from './demandes/demande/demande.controller';
import { DemandeService } from './demandes/demande/demande.service';
import { SocieteModule } from './demandes/societe/societe.module';
import { PrismaModule } from './prisma/prisma.module';
import { CapacitesModule } from './demandes/capacites/capacites.module';
import { SubstancesModule } from './demandes/substances/substances.module';
import { DocumentsModule } from './demandes/documents/document.module';
import { DemandeSummaryControllerModule } from './demandes/popup/popup.module';
import { InteractionWaliModule } from './demandes/avis_wali/interaction-wali.module';
import { ComiteDirectionModule } from './demandes/cd/cd.module';
import { ProcedureModule } from './dashboard/procedure.module';
import { ProcedureEtapeModule } from './procedure_etape/procedure-etape.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './role/admin.module';
import { TypePermisModule } from './demandes/type permis/type_permis.module';
import { AdminDossierModule } from './role/admin_dossier_administratif.module';
import { CoordonneesModule } from './demandes/cadastre/coordonnees.module';
import { CommuneModule } from './demandes/antennes/commune/commune.module';
import { WilayaModule } from './demandes/antennes/wilaya/wilaya.module';
import { DairaModule } from './demandes/antennes/daira/daira.module';
import { GeneratePermisModule } from './demandes/permis_generation/permis.module';
import { GeneratePdfModule } from './demandes/permis_generation/generate_permis_pdf.module';
import { PermisDashboardfModule } from './demandes/permis_dashboard/permis-dashboard.module';
import { CahierChargeModule } from './cahiercharge/cahier-charge.module';
import { PaymentModule } from './demandes/paiement/payement.module';
import { ProcedureRenouvellementModule } from './renouvellement/procedure_renouvellement.module';
import { ConfigModule } from '@nestjs/config';
import { TimelineModule } from './demandes/timeline of procedure/timeline.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { SessionModule } from './session/session.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './audit-log/audit-log.interceptor';
import { ExpertMinierModule } from './demandes/expert_minier/expert-minier.module';
import { SeanceModule } from './demandes/seances/seance.module';
import { DecisionModule } from './demandes/decisions/decision.module';
import { ComitenModule } from './demandes/comites/comite.module';
import { DecisionTrackingModule } from './demandes/suivi_decisions/decision-tracking.module';


@Module({
  imports: [DemandesModule,PaymentModule,ConfigModule.forRoot({
      isGlobal: true,
    }),ProcedureRenouvellementModule,DecisionTrackingModule,ComitenModule,DecisionModule,SeanceModule,ExpertMinierModule,SessionModule,AuditLogModule,PermisDashboardfModule,TimelineModule,CahierChargeModule,GeneratePdfModule,GeneratePermisModule,WilayaModule,DairaModule,CommuneModule,AdminDossierModule,CoordonneesModule,TypePermisModule,AuthModule,AdminModule,PrismaModule,ProcedureEtapeModule,ProcedureModule,ComiteDirectionModule,SocieteModule,InteractionWaliModule,CapacitesModule,SubstancesModule,DocumentsModule,DemandeSummaryControllerModule],
  controllers: [DemandesController],
  providers: [DemandeService,/*{
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    }*/],

})
export class AppModule {}
