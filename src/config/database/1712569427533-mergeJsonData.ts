import { MigrationInterface, QueryRunner } from 'typeorm';
import GRSDebtorListJSON from '../../lib/grsWasteRecord.json';
import grsTestData from '../../lib/grsTestData.json';
import { writeFile } from 'fs/promises';

export class MergeJsonData1712569427533 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //
    grsTestData.forEach((d) => {
      const existingRecord = GRSDebtorListJSON.find(
        (da) => da['Code'] === d['Code'].toString(),
      );

      if (!existingRecord && !Number.isNaN(Number(d.Code.trim()))) {
        const data = {
          ...d,
          Code: Number(d.Code.trim()),
        };
        GRSDebtorListJSON.push(data as any);
      }
    });

    writeFile('grsData.json', JSON.stringify(GRSDebtorListJSON));
    console.log('done');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
