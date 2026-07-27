import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR', 'VIGILANTE')
  @Get()
  @ApiOperation({ summary: 'Búsqueda global' })
  globalSearch(@Query('q') q: string, @Query('conjuntoId') conjuntoId?: string) {
    return this.searchService.globalSearch(q, conjuntoId ? +conjuntoId : undefined);
  }
}
