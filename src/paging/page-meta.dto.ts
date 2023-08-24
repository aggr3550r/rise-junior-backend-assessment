import { IPageMetaDTOParameters } from '../interfaces/IPageMetaDTOParameters';

export class PageMetaDTO {
  current_page: number;

  items_per_page: number;

  total_items: number;

  total_pages: number;

  has_previous_page: boolean;

  has_next_page: boolean;

  constructor({ page_options_dto, total_items }: IPageMetaDTOParameters) {
    this.current_page = page_options_dto.page;
    this.items_per_page = page_options_dto.take;
    this.total_items = total_items;
    this.total_pages = Math.ceil(this.total_items / this.items_per_page);
    this.has_previous_page = this.current_page > 1;
    this.has_next_page = this.current_page < this.total_pages;
  }
}
