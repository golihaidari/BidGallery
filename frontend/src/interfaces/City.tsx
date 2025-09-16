export interface City {
    href:                 string;
    nr:                   string;
    navn:                 string;
    stormodtageradresser: null;
    bbox:                 number[];
    visueltcenter:        number[];
    kommuner:             Kommuner[];
    ændret:               Date;
    geo_ændret:           Date;
    geo_version:          number;
    dagi_id:              string;
}

export interface Kommuner {
    href: string;
    kode: string;
    navn: string;
}

