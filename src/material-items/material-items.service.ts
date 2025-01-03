import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MaterialItems } from './entity/material-item.entity';
import { Repository } from 'typeorm';
import { CreateOrUpdateMaterialItemDto } from './dto/createOrUpdateMaterialItem.dto';
import { VectorServiceService } from 'src/vector-service/vector-service.service';

@Injectable()
export class MaterialItemsService {
  constructor(
    @InjectRepository(MaterialItems)
    private readonly materialItemsRepository: Repository<MaterialItems>,
    private readonly vectorService: VectorServiceService,
  ) {}
  async createMaterialItem(input: CreateOrUpdateMaterialItemDto) {
    const materialItem = this.materialItemsRepository.create({
      ...input,
      isSync: false,
      status: 'active',
    });
    return await this.materialItemsRepository.save(materialItem);
  }

  async deleteMaterialItem(id: number): Promise<boolean> {
    const materialItem = await this.materialItemsRepository.findOne({
      where: { id },
    });
    if (!materialItem) {
      throw new Error('Material item not found');
    }
    await this.materialItemsRepository.delete(id);
    return true;
  }

  async getMaterialItems(): Promise<MaterialItems[]> {
    return await this.materialItemsRepository.find();
  }

  async syncMaterialItem(id: number) {
    const materialItem = await this.materialItemsRepository.findOne({
      where: {
        id,
      },
      relations: ['material'],
    });
    if (!materialItem) {
      throw new Error('Material item not found');
    }

    materialItem.isSync = true;
    await this.vectorService.syncDataToVectoDb(materialItem);
    return await this.materialItemsRepository.save(materialItem);
  }
}
