import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/common/prisma.service';
import { PaginationDto } from 'src/common/application/dtos/pagination.dto';
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
    const { page, limit } = paginationDto;

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: { available: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({
        where: { available: true },
      }),
    ]);

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, available: true },
    });

    if (!product) {
      throw new RpcException({ statusCode: HttpStatus.NOT_FOUND, message: 'Product not found' });
    }

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
      data: { available: false },
    });
  }
}
