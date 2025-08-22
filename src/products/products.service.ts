import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;
    const skip = (page - 1) * limit;

    const count = await this.prisma.product.count();

    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const data = await this.prisma.product.findMany({
      skip,
      take: limit,
      where: {
        available: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return {
      data,
      meta: {
        page,
        limit,
        hasNextPage,
        hasPreviousPage,
        totalPages,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, available: true },
    });

    if (!product)
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Product with id ${id} not found`,
      });

    return product;
  }

  async update(updateProductDto: UpdateProductDto) {
    const { id, ...toUpdate } = updateProductDto;
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: toUpdate,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: {
        available: false,
      },
    });
  }
}
