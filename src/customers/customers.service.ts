import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Customer } from './customers.entity';
import { ShopService } from '../shops/shops.service';
import { ChannelsService } from '../channels/channels.service';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerResponseDto,
  CustomerListQueryDto,
  CustomerListResponseDto,
} from './customers.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly shopService: ShopService,
    private readonly channelService: ChannelsService,
  ) {}

  async create(
    createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    try {
      const { platform, externalId, name, shopId, channelId } =
        createCustomerDto;

      // Check if shop exists using ShopService
      let shop;
      try {
        shop = await this.shopService.findOne(shopId);
      } catch (error) {
        throw new BadRequestException(`Shop with ID ${shopId} not found`);
      }

      // Check if channel exists using ChannelService
      let channel;
      try {
        channel = await this.channelService.getOne(channelId);
      } catch (error) {
        throw new BadRequestException(`Channel with ID ${channelId} not found`);
      }

      // Check if customer with same platform and externalId already exists
      const existingCustomer = await this.customerRepository.findOne({
        where: { platform, externalId },
      });
      if (existingCustomer) {
        throw new ConflictException(
          `Customer with platform '${platform}' and external ID '${externalId}' already exists`,
        );
      }

      // Create new customer
      const customer = this.customerRepository.create({
        platform,
        externalId,
        name,
        shop,
        channel,
      });

      const savedCustomer = await this.customerRepository.save(customer);
      return this.mapToResponseDto(savedCustomer);
    } catch (error) {
      // Re-throw known errors
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      // Handle unexpected errors
      throw new InternalServerErrorException(
        `Failed to create customer: ${error.message}`,
      );
    }
  }

  async findAll(query: CustomerListQueryDto): Promise<CustomerListResponseDto> {
    const { platform, shopId, channelId, name, page = 1, limit = 10 } = query;

    const whereConditions: any = {};

    if (platform) {
      whereConditions.platform = platform;
    }

    if (shopId) {
      // Validate shop exists using ShopService
      await this.shopService.findOne(shopId);
      whereConditions.shop = { id: shopId };
    }

    if (channelId) {
      // Validate channel exists using ChannelService
      await this.channelService.getOne(channelId);
      whereConditions.channel = { id: channelId };
    }

    if (name) {
      whereConditions.name = Like(`%${name}%`);
    }

    const findOptions: FindManyOptions<Customer> = {
      where: whereConditions,
      relations: ['shop', 'channel'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [customers, total] =
      await this.customerRepository.findAndCount(findOptions);

    const data = customers.map((customer) => this.mapToResponseDto(customer));
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['shop', 'channel'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return this.mapToResponseDto(customer);
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    try {
      const { platform, externalId, name, shopId, channelId } =
        updateCustomerDto;

      const customer = await this.customerRepository.findOne({
        where: { id },
        relations: ['shop', 'channel'],
      });

      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }

      // Check if shop exists using ShopService (if shopId is provided)
      if (shopId && shopId !== customer.shop?.id) {
        try {
          const shop = await this.shopService.findOne(shopId);
          customer.shop = shop;
        } catch (error) {
          throw new BadRequestException(`Shop with ID ${shopId} not found`);
        }
      }

      // Check if channel exists using ChannelService (if channelId is provided)
      if (channelId && channelId !== customer.channel?.id) {
        try {
          const channel = await this.channelService.getOne(channelId);
          customer.channel = channel;
        } catch (error) {
          throw new BadRequestException(
            `Channel with ID ${channelId} not found`,
          );
        }
      }

      // Check for duplicate platform + externalId (if either is being updated)
      if (platform || externalId) {
        const checkPlatform = platform || customer.platform;
        const checkExternalId = externalId || customer.externalId;

        const existingCustomer = await this.customerRepository.findOne({
          where: { platform: checkPlatform, externalId: checkExternalId },
        });

        if (existingCustomer && existingCustomer.id !== id) {
          throw new ConflictException(
            `Customer with platform '${checkPlatform}' and external ID '${checkExternalId}' already exists`,
          );
        }
      }

      // Update customer fields
      if (platform) customer.platform = platform;
      if (externalId) customer.externalId = externalId;
      if (name !== undefined) customer.name = name;

      const updatedCustomer = await this.customerRepository.save(customer);
      return this.mapToResponseDto(updatedCustomer);
    } catch (error) {
      // Re-throw known errors
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      // Handle unexpected errors
      throw new InternalServerErrorException(
        `Failed to update customer with ID ${id}: ${error.message}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await this.customerRepository.remove(customer);
  }

  async findByExternalId(
    platform: string,
    externalId: string,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({
      where: { platform, externalId },
      relations: ['shop', 'channel'],
    });

    if (!customer) {
      throw new NotFoundException(
        `Customer with platform '${platform}' and external ID '${externalId}' not found`,
      );
    }

    return this.mapToResponseDto(customer);
  }

  async findByPlatform(platform: string): Promise<Customer[]> {
    return this.customerRepository.find({
      where: { platform },
      relations: ['shop', 'channel'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByShopId(shopId: string): Promise<Customer[]> {
    // Validate shop exists using ShopService
    await this.shopService.findOne(shopId);

    return this.customerRepository.find({
      where: { shop: { id: shopId } },
      relations: ['shop', 'channel'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByChannelId(channelId: number): Promise<Customer[]> {
    // Validate channel exists using ChannelService
    await this.channelService.getOne(channelId);

    return this.customerRepository.find({
      where: { channel: { id: channelId } },
      relations: ['shop', 'channel'],
      order: { createdAt: 'DESC' },
    });
  }

  async searchByName(searchTerm: string): Promise<Customer[]> {
    return this.customerRepository.find({
      where: { name: Like(`%${searchTerm}%`) },
      relations: ['shop', 'channel'],
      order: { createdAt: 'DESC' },
    });
  }

  private mapToResponseDto(customer: Customer): CustomerResponseDto {
    return {
      id: customer.id,
      platform: customer.platform,
      externalId: customer.externalId,
      name: customer.name,
      shopId: customer.shop?.id,
      channelId: customer.channel?.id,
      shop: customer.shop
        ? {
            id: customer.shop.id,
            name: customer.shop.name,
          }
        : null,
      channel: customer.channel
        ? {
            id: customer.channel.id,
            name: customer.channel.name,
          }
        : null,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
