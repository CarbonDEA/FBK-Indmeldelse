import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MembersService } from './members.service';

@ApiTags('members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @ApiOperation({ summary: 'List all members' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.membersService.findAll({
      search,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get member details' })
  async findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Post(':id/terminate')
  @ApiOperation({ summary: 'Terminate a member' })
  @ApiResponse({ status: 200, description: 'Member terminated successfully' })
  async terminate(@Param('id') id: string) {
    // In production, get actor from JWT
    return this.membersService.terminate(id, 'admin');
  }
}
