import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OffersService } from './offers.service';
import { CreateOfferDto, OfferQueryDto } from './dto/offer.dto';

@ApiTags('Offers')
@Controller('offers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new offer' })
  create(@Body() dto: CreateOfferDto) {
    return this.offersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all offers' })
  findAll(@Query() query: OfferQueryDto) {
    return this.offersService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get offer statistics' })
  getStats() {
    return this.offersService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get offer by ID' })
  findOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send offer to candidate' })
  send(@Param('id') id: string) {
    return this.offersService.send(id);
  }

  @Post(':id/sign')
  @ApiOperation({ summary: 'Mark offer as signed' })
  sign(@Param('id') id: string) {
    return this.offersService.sign(id);
  }

  @Post(':id/decline')
  @ApiOperation({ summary: 'Decline offer' })
  decline(@Param('id') id: string) {
    return this.offersService.decline(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Withdraw offer' })
  withdraw(@Param('id') id: string) {
    return this.offersService.withdraw(id);
  }
}