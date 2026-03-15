import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
  HttpCode,
} from "@nestjs/common";
import { ShipmentService } from "./shipment.service";
import { CreateShipmentDto } from "./dto/create-shipment.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";

@Controller("shipments")
export class ShipmentController {
  constructor(private readonly service: ShipmentService) {}

  @Get()
  async readMany(): Promise<object[]> {
    return await this.service.readMany();
  }

  @Get(":id")
  async readOne(@Param("id") id: string): Promise<object> {
    return await this.service.readOne(id);
  }

  @Post()
  async create(@Body() dto: CreateShipmentDto): Promise<object> {
    return await this.service.create(dto);
  }

  @Patch(":id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateStatusDto,
  ): Promise<object> {
    return await this.service.updateStatus(id, dto.status);
  }

  @Delete(":id")
  async delete(@Param("id") id: string): Promise<void> {
    await this.service.delete(id);
  }

  @Get("by-object/:objectId")
  async getByObject(@Param("objectId") objectId: string): Promise<object[]> {
    return await this.service.getShipmentsByObject(objectId);
  }

  @Get("by-warehouse/:warehouseId")
  async getByWarehouse(
    @Param("warehouseId") warehouseId: string,
  ): Promise<object[]> {
    return await this.service.getShipmentsByWarehouse(warehouseId);
  }
}
