"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sh1701115047588 = void 0;
class Sh1701115047588 {
    constructor() {
        this.name = 'Sh1701115047588';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_a43a3432712abf6999a2d2b04d5"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP CONSTRAINT "FK_504999c66323a54bd6c3a612897"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP CONSTRAINT "FK_731c81c6a06eda8f9243afaa1e9"`);
            yield queryRunner.query(`ALTER TABLE "billing_account" DROP CONSTRAINT "FK_3b89fe380823ffbf39a27a95db3"`);
            yield queryRunner.query(`ALTER TABLE "billing" DROP CONSTRAINT "FK_02821cf41d28d2940c51f0e9424"`);
            yield queryRunner.query(`ALTER TABLE "billing" DROP CONSTRAINT "FK_435cc3a0534871880c91256ed91"`);
            yield queryRunner.query(`ALTER TABLE "payment" RENAME COLUMN "entitySubscriberPropertyId" TO "propertySubscriptionId"`);
            yield queryRunner.query(`ALTER TABLE "billing_account" RENAME COLUMN "entitySubscriberPropertyId" TO "propertySubscriptionId"`);
            yield queryRunner.query(`CREATE TABLE "property_subscription_unit" ("propertySubscriptionId" bigint NOT NULL, "entiySubscriberPropertyId" bigint NOT NULL, "propertyUnits" integer NOT NULL, CONSTRAINT "PK_7ca55ff356d6bb0ac1004f4c5d5" PRIMARY KEY ("propertySubscriptionId", "entiySubscriberPropertyId"))`);
            yield queryRunner.query(`CREATE TYPE "public"."property_subscription_subscriberpropertyrole_enum" AS ENUM('owner', 'custodian')`);
            yield queryRunner.query(`CREATE TABLE "property_subscription" ("id" BIGSERIAL NOT NULL, "subscriberPropertyRole" "public"."property_subscription_subscriberpropertyrole_enum" NOT NULL, "oldCode" bigint, "streetNumber" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "streetId" bigint NOT NULL, "entitySubscriberProfileId" bigint NOT NULL, CONSTRAINT "PK_1f40586f46849b46f87fa38e509" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP COLUMN "streetNumber"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP COLUMN "oldCode"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP COLUMN "streetId"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP COLUMN "billingAccountId"`);
            yield queryRunner.query(`ALTER TABLE "billing" DROP COLUMN "entitySubscriberProfileId"`);
            yield queryRunner.query(`ALTER TABLE "billing" DROP COLUMN "entitySubscriberProertyId"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD "ownerEntitySubscriberProfileId" bigint`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD "propertySubscriptionUnitsPropertySubscriptionId" bigint`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD "propertySubscriptionUnitsEntiySubscriberPropertyId" bigint`);
            yield queryRunner.query(`ALTER TABLE "billing" ADD "propertySubscriptionId" bigint NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_b5852bf023107e65946b8a5e763" FOREIGN KEY ("propertySubscriptionId") REFERENCES "property_subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD CONSTRAINT "FK_fa2599eede9337bb52313e2cb36" FOREIGN KEY ("propertySubscriptionUnitsPropertySubscriptionId", "propertySubscriptionUnitsEntiySubscriberPropertyId") REFERENCES "property_subscription_unit"("propertySubscriptionId","entiySubscriberPropertyId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "property_subscription_unit" ADD CONSTRAINT "FK_0bd27ce60cb73a32a1575b6d772" FOREIGN KEY ("propertySubscriptionId") REFERENCES "property_subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "property_subscription_unit" ADD CONSTRAINT "FK_bd4e7746f841009577a4b2bcff7" FOREIGN KEY ("entiySubscriberPropertyId") REFERENCES "entity_subscriber_property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "billing_account" ADD CONSTRAINT "FK_b7e066156e66401ba4944562828" FOREIGN KEY ("propertySubscriptionId") REFERENCES "property_subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "property_subscription" ADD CONSTRAINT "FK_d4b08b995963839ecc4be530f5f" FOREIGN KEY ("streetId") REFERENCES "street"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "property_subscription" ADD CONSTRAINT "FK_9b4fdd3749b71bd2ee2a5467e9f" FOREIGN KEY ("entitySubscriberProfileId") REFERENCES "entity_subscriber_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "billing" ADD CONSTRAINT "FK_b7a66041ff8a16c94e74c151a08" FOREIGN KEY ("propertySubscriptionId") REFERENCES "property_subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "billing" DROP CONSTRAINT "FK_b7a66041ff8a16c94e74c151a08"`);
            yield queryRunner.query(`ALTER TABLE "property_subscription" DROP CONSTRAINT "FK_9b4fdd3749b71bd2ee2a5467e9f"`);
            yield queryRunner.query(`ALTER TABLE "property_subscription" DROP CONSTRAINT "FK_d4b08b995963839ecc4be530f5f"`);
            yield queryRunner.query(`ALTER TABLE "billing_account" DROP CONSTRAINT "FK_b7e066156e66401ba4944562828"`);
            yield queryRunner.query(`ALTER TABLE "property_subscription_unit" DROP CONSTRAINT "FK_bd4e7746f841009577a4b2bcff7"`);
            yield queryRunner.query(`ALTER TABLE "property_subscription_unit" DROP CONSTRAINT "FK_0bd27ce60cb73a32a1575b6d772"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP CONSTRAINT "FK_fa2599eede9337bb52313e2cb36"`);
            yield queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_b5852bf023107e65946b8a5e763"`);
            yield queryRunner.query(`ALTER TABLE "billing" DROP COLUMN "propertySubscriptionId"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP COLUMN "propertySubscriptionUnitsEntiySubscriberPropertyId"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP COLUMN "propertySubscriptionUnitsPropertySubscriptionId"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP COLUMN "ownerEntitySubscriberProfileId"`);
            yield queryRunner.query(`ALTER TABLE "billing" ADD "entitySubscriberProertyId" bigint NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "billing" ADD "entitySubscriberProfileId" bigint NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD "billingAccountId" bigint`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD "streetId" bigint NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD "oldCode" bigint NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD "streetNumber" integer NOT NULL`);
            yield queryRunner.query(`DROP TABLE "property_subscription"`);
            yield queryRunner.query(`DROP TYPE "public"."property_subscription_subscriberpropertyrole_enum"`);
            yield queryRunner.query(`DROP TABLE "property_subscription_unit"`);
            yield queryRunner.query(`ALTER TABLE "billing_account" RENAME COLUMN "propertySubscriptionId" TO "entitySubscriberPropertyId"`);
            yield queryRunner.query(`ALTER TABLE "payment" RENAME COLUMN "propertySubscriptionId" TO "entitySubscriberPropertyId"`);
            yield queryRunner.query(`ALTER TABLE "billing" ADD CONSTRAINT "FK_435cc3a0534871880c91256ed91" FOREIGN KEY ("entitySubscriberProfileId") REFERENCES "entity_subscriber_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "billing" ADD CONSTRAINT "FK_02821cf41d28d2940c51f0e9424" FOREIGN KEY ("entitySubscriberProertyId") REFERENCES "entity_subscriber_property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "billing_account" ADD CONSTRAINT "FK_3b89fe380823ffbf39a27a95db3" FOREIGN KEY ("entitySubscriberPropertyId") REFERENCES "entity_subscriber_property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD CONSTRAINT "FK_731c81c6a06eda8f9243afaa1e9" FOREIGN KEY ("billingAccountId") REFERENCES "billing_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD CONSTRAINT "FK_504999c66323a54bd6c3a612897" FOREIGN KEY ("streetId") REFERENCES "street"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_a43a3432712abf6999a2d2b04d5" FOREIGN KEY ("entitySubscriberPropertyId") REFERENCES "entity_subscriber_property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
}
exports.Sh1701115047588 = Sh1701115047588;
