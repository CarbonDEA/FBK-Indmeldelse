import {
  Controller,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { verifyToken } from '../../common/utils/jwt.util';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new membership application' })
  @ApiResponse({ status: 201, description: 'Application created successfully' })
  async create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a membership application' })
  @ApiResponse({ status: 200, description: 'Application approved successfully' })
  async approve(
    @Param('id') id: string,
    @Query('token') token: string,
  ) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    // Verify token
    const payload = verifyToken(token);
    
    if (payload.scope !== 'application:approve' || payload.sub !== id) {
      throw new BadRequestException('Invalid token');
    }

    return this.applicationsService.approve(id, payload.iss);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a membership application' })
  @ApiResponse({ status: 200, description: 'Application rejected successfully' })
  async reject(
    @Param('id') id: string,
    @Query('token') token: string,
  ) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    // Verify token
    const payload = verifyToken(token);
    
    if (payload.scope !== 'application:reject' || payload.sub !== id) {
      throw new BadRequestException('Invalid token');
    }

    return this.applicationsService.reject(id, payload.iss);
  }
}
