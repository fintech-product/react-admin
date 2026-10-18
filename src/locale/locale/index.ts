import { HttpRequest } from "axios-core"
import { Client } from "web-clients"
import { type Locale, type LocaleFilter, localeModel, type LocaleService } from "./locale"

export * from "./locale"

export class LocaleClient extends Client<Locale, string, LocaleFilter> implements LocaleService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, localeModel)
    this.searchGet = true
  }
}
