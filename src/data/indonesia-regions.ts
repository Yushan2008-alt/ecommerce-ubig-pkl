// Master Data Wilayah Indonesia (34 Provinsi & 514 Kota/Kabupaten)
// Diekstrak dari dataset Kemendagri

export interface ProvinceItem {
  id: string
  name: string
}

export interface CityItem {
  id: string
  provinceId: string
  provinceName: string
  name: string
  postalCode: string
}

export const INDONESIA_PROVINCES: ProvinceItem[] = [
  {
    "id": "11",
    "name": "Aceh"
  },
  {
    "id": "51",
    "name": "Bali"
  },
  {
    "id": "36",
    "name": "Banten"
  },
  {
    "id": "17",
    "name": "Bengkulu"
  },
  {
    "id": "34",
    "name": "DI Yogyakarta"
  },
  {
    "id": "31",
    "name": "DKI Jakarta"
  },
  {
    "id": "75",
    "name": "Gorontalo"
  },
  {
    "id": "15",
    "name": "Jambi"
  },
  {
    "id": "32",
    "name": "Jawa Barat"
  },
  {
    "id": "33",
    "name": "Jawa Tengah"
  },
  {
    "id": "35",
    "name": "Jawa Timur"
  },
  {
    "id": "61",
    "name": "Kalimantan Barat"
  },
  {
    "id": "63",
    "name": "Kalimantan Selatan"
  },
  {
    "id": "62",
    "name": "Kalimantan Tengah"
  },
  {
    "id": "64",
    "name": "Kalimantan Timur"
  },
  {
    "id": "65",
    "name": "Kalimantan Utara"
  },
  {
    "id": "19",
    "name": "Kepulauan Bangka Belitung"
  },
  {
    "id": "21",
    "name": "Kepulauan Riau"
  },
  {
    "id": "18",
    "name": "Lampung"
  },
  {
    "id": "81",
    "name": "Maluku"
  },
  {
    "id": "82",
    "name": "Maluku Utara"
  },
  {
    "id": "52",
    "name": "Nusa Tenggara Barat"
  },
  {
    "id": "53",
    "name": "Nusa Tenggara Timur"
  },
  {
    "id": "94",
    "name": "Papua"
  },
  {
    "id": "91",
    "name": "Papua Barat"
  },
  {
    "id": "14",
    "name": "Riau"
  },
  {
    "id": "76",
    "name": "Sulawesi Barat"
  },
  {
    "id": "73",
    "name": "Sulawesi Selatan"
  },
  {
    "id": "72",
    "name": "Sulawesi Tengah"
  },
  {
    "id": "74",
    "name": "Sulawesi Tenggara"
  },
  {
    "id": "71",
    "name": "Sulawesi Utara"
  },
  {
    "id": "13",
    "name": "Sumatera Barat"
  },
  {
    "id": "16",
    "name": "Sumatera Selatan"
  },
  {
    "id": "12",
    "name": "Sumatera Utara"
  }
]

export const INDONESIA_CITIES: CityItem[] = [
  {
    "id": "1107",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Aceh Barat",
    "postalCode": "23870"
  },
  {
    "id": "1112",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Aceh Barat Daya",
    "postalCode": "23530"
  },
  {
    "id": "1108",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Aceh Besar",
    "postalCode": "23980"
  },
  {
    "id": "1116",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Aceh Jaya",
    "postalCode": "23970"
  },
  {
    "id": "1103",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Aceh Selatan",
    "postalCode": "23711"
  },
  {
    "id": "1102",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Aceh Singkil",
    "postalCode": "24785"
  },
  {
    "id": "1114",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Aceh Tamiang",
    "postalCode": "23750"
  },
  {
    "id": "1106",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Aceh Tengah",
    "postalCode": "23760"
  },
  {
    "id": "1104",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Aceh Tenggara",
    "postalCode": "24651"
  },
  {
    "id": "1105",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Aceh Timur",
    "postalCode": "23611"
  },
  {
    "id": "1111",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Aceh Utara",
    "postalCode": "23420"
  },
  {
    "id": "1307",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kabupaten Agam",
    "postalCode": "25870"
  },
  {
    "id": "5307",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Alor",
    "postalCode": "85870"
  },
  {
    "id": "1208",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Asahan",
    "postalCode": "20980"
  },
  {
    "id": "9415",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Asmat",
    "postalCode": "10860"
  },
  {
    "id": "5103",
    "provinceId": "51",
    "provinceName": "Bali",
    "name": "Kabupaten Badung",
    "postalCode": "80430"
  },
  {
    "id": "6311",
    "provinceId": "63",
    "provinceName": "Kalimantan Selatan",
    "name": "Kabupaten Balangan",
    "postalCode": "70420"
  },
  {
    "id": "3204",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Bandung",
    "postalCode": "40540"
  },
  {
    "id": "3217",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Bandung Barat",
    "postalCode": "40190"
  },
  {
    "id": "7202",
    "provinceId": "72",
    "provinceName": "Sulawesi Tengah",
    "name": "Kabupaten Banggai",
    "postalCode": "94320"
  },
  {
    "id": "7201",
    "provinceId": "72",
    "provinceName": "Sulawesi Tengah",
    "name": "Kabupaten Banggai Kepulauan",
    "postalCode": "94210"
  },
  {
    "id": "7211",
    "provinceId": "72",
    "provinceName": "Sulawesi Tengah",
    "name": "Kabupaten Banggai Laut",
    "postalCode": "94420"
  },
  {
    "id": "1901",
    "provinceId": "19",
    "provinceName": "Kepulauan Bangka Belitung",
    "name": "Kabupaten Bangka",
    "postalCode": "33210"
  },
  {
    "id": "1903",
    "provinceId": "19",
    "provinceName": "Kepulauan Bangka Belitung",
    "name": "Kabupaten Bangka Barat",
    "postalCode": "33430"
  },
  {
    "id": "1905",
    "provinceId": "19",
    "provinceName": "Kepulauan Bangka Belitung",
    "name": "Kabupaten Bangka Selatan",
    "postalCode": "33650"
  },
  {
    "id": "1904",
    "provinceId": "19",
    "provinceName": "Kepulauan Bangka Belitung",
    "name": "Kabupaten Bangka Tengah",
    "postalCode": "33540"
  },
  {
    "id": "3526",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Bangkalan",
    "postalCode": "60290"
  },
  {
    "id": "5106",
    "provinceId": "51",
    "provinceName": "Bali",
    "name": "Kabupaten Bangli",
    "postalCode": "80760"
  },
  {
    "id": "6303",
    "provinceId": "63",
    "provinceName": "Kalimantan Selatan",
    "name": "Kabupaten Banjar",
    "postalCode": "70430"
  },
  {
    "id": "3304",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Banjarnegara",
    "postalCode": "50540"
  },
  {
    "id": "7303",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Bantaeng",
    "postalCode": "90430"
  },
  {
    "id": "3402",
    "provinceId": "34",
    "provinceName": "DI Yogyakarta",
    "name": "Kabupaten Bantul",
    "postalCode": "55320"
  },
  {
    "id": "1607",
    "provinceId": "16",
    "provinceName": "Sumatera Selatan",
    "name": "Kabupaten Banyu Asin",
    "postalCode": "30870"
  },
  {
    "id": "3302",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Banyumas",
    "postalCode": "50320"
  },
  {
    "id": "3510",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Banyuwangi",
    "postalCode": "60310"
  },
  {
    "id": "6304",
    "provinceId": "63",
    "provinceName": "Kalimantan Selatan",
    "name": "Kabupaten Barito Kuala",
    "postalCode": "70540"
  },
  {
    "id": "6204",
    "provinceId": "62",
    "provinceName": "Kalimantan Tengah",
    "name": "Kabupaten Barito Selatan",
    "postalCode": "73540"
  },
  {
    "id": "6212",
    "provinceId": "62",
    "provinceName": "Kalimantan Tengah",
    "name": "Kabupaten Barito Timur",
    "postalCode": "73530"
  },
  {
    "id": "6205",
    "provinceId": "62",
    "provinceName": "Kalimantan Tengah",
    "name": "Kabupaten Barito Utara",
    "postalCode": "73650"
  },
  {
    "id": "7310",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Barru",
    "postalCode": "90310"
  },
  {
    "id": "3325",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Batang",
    "postalCode": "50180"
  },
  {
    "id": "1504",
    "provinceId": "15",
    "provinceName": "Jambi",
    "name": "Kabupaten Batang Hari",
    "postalCode": "36540"
  },
  {
    "id": "1219",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Batu Bara",
    "postalCode": "20410"
  },
  {
    "id": "3216",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Bekasi",
    "postalCode": "40970"
  },
  {
    "id": "1902",
    "provinceId": "19",
    "provinceName": "Kepulauan Bangka Belitung",
    "name": "Kabupaten Belitung",
    "postalCode": "33320"
  },
  {
    "id": "1906",
    "provinceId": "19",
    "provinceName": "Kepulauan Bangka Belitung",
    "name": "Kabupaten Belitung Timur",
    "postalCode": "33760"
  },
  {
    "id": "5306",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Belu",
    "postalCode": "85760"
  },
  {
    "id": "1117",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Bener Meriah",
    "postalCode": "23190"
  },
  {
    "id": "1408",
    "provinceId": "14",
    "provinceName": "Riau",
    "name": "Kabupaten Bengkalis",
    "postalCode": "28980"
  },
  {
    "id": "6102",
    "provinceId": "61",
    "provinceName": "Kalimantan Barat",
    "name": "Kabupaten Bengkayang",
    "postalCode": "78320"
  },
  {
    "id": "1701",
    "provinceId": "17",
    "provinceName": "Bengkulu",
    "name": "Kabupaten Bengkulu Selatan",
    "postalCode": "38210"
  },
  {
    "id": "1709",
    "provinceId": "17",
    "provinceName": "Bengkulu",
    "name": "Kabupaten Bengkulu Tengah",
    "postalCode": "38200"
  },
  {
    "id": "1703",
    "provinceId": "17",
    "provinceName": "Bengkulu",
    "name": "Kabupaten Bengkulu Utara",
    "postalCode": "38430"
  },
  {
    "id": "6405",
    "provinceId": "64",
    "provinceName": "Kalimantan Timur",
    "name": "Kabupaten Berau",
    "postalCode": "75650"
  },
  {
    "id": "9409",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Biak Numfor",
    "postalCode": "10200"
  },
  {
    "id": "5206",
    "provinceId": "52",
    "provinceName": "Nusa Tenggara Barat",
    "name": "Kabupaten Bima",
    "postalCode": "83760"
  },
  {
    "id": "2102",
    "provinceId": "21",
    "provinceName": "Kepulauan Riau",
    "name": "Kabupaten Bintan",
    "postalCode": "29320"
  },
  {
    "id": "1110",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Bireuen",
    "postalCode": "23310"
  },
  {
    "id": "3505",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Blitar",
    "postalCode": "60650"
  },
  {
    "id": "3316",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Blora",
    "postalCode": "50970"
  },
  {
    "id": "7501",
    "provinceId": "75",
    "provinceName": "Gorontalo",
    "name": "Kabupaten Boalemo",
    "postalCode": "96210"
  },
  {
    "id": "3201",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Bogor",
    "postalCode": "40210"
  },
  {
    "id": "3522",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Bojonegoro",
    "postalCode": "60740"
  },
  {
    "id": "7101",
    "provinceId": "71",
    "provinceName": "Sulawesi Utara",
    "name": "Kabupaten Bolaang Mongondow",
    "postalCode": "95210"
  },
  {
    "id": "7110",
    "provinceId": "71",
    "provinceName": "Sulawesi Utara",
    "name": "Kabupaten Bolaang Mongondow Selatan",
    "postalCode": "95310"
  },
  {
    "id": "7111",
    "provinceId": "71",
    "provinceName": "Sulawesi Utara",
    "name": "Kabupaten Bolaang Mongondow Timur",
    "postalCode": "95420"
  },
  {
    "id": "7107",
    "provinceId": "71",
    "provinceName": "Sulawesi Utara",
    "name": "Kabupaten Bolaang Mongondow Utara",
    "postalCode": "95870"
  },
  {
    "id": "7406",
    "provinceId": "74",
    "provinceName": "Sulawesi Tenggara",
    "name": "Kabupaten Bombana",
    "postalCode": "93760"
  },
  {
    "id": "3511",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Bondowoso",
    "postalCode": "60420"
  },
  {
    "id": "7311",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Bone",
    "postalCode": "90420"
  },
  {
    "id": "7504",
    "provinceId": "75",
    "provinceName": "Gorontalo",
    "name": "Kabupaten Bone Bolango",
    "postalCode": "96540"
  },
  {
    "id": "9413",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Boven Digoel",
    "postalCode": "10640"
  },
  {
    "id": "3309",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Boyolali",
    "postalCode": "50200"
  },
  {
    "id": "3329",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Brebes",
    "postalCode": "50620"
  },
  {
    "id": "5108",
    "provinceId": "51",
    "provinceName": "Bali",
    "name": "Kabupaten Buleleng",
    "postalCode": "80980"
  },
  {
    "id": "7302",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Bulukumba",
    "postalCode": "90320"
  },
  {
    "id": "6502",
    "provinceId": "65",
    "provinceName": "Kalimantan Utara",
    "name": "Kabupaten Bulungan",
    "postalCode": "77320"
  },
  {
    "id": "1509",
    "provinceId": "15",
    "provinceName": "Jambi",
    "name": "Kabupaten Bungo",
    "postalCode": "36200"
  },
  {
    "id": "7207",
    "provinceId": "72",
    "provinceName": "Sulawesi Tengah",
    "name": "Kabupaten Buol",
    "postalCode": "94870"
  },
  {
    "id": "8104",
    "provinceId": "81",
    "provinceName": "Maluku",
    "name": "Kabupaten Buru",
    "postalCode": "97540"
  },
  {
    "id": "8109",
    "provinceId": "81",
    "provinceName": "Maluku",
    "name": "Kabupaten Buru Selatan",
    "postalCode": "97200"
  },
  {
    "id": "7401",
    "provinceId": "74",
    "provinceName": "Sulawesi Tenggara",
    "name": "Kabupaten Buton",
    "postalCode": "93210"
  },
  {
    "id": "7415",
    "provinceId": "74",
    "provinceName": "Sulawesi Tenggara",
    "name": "Kabupaten Buton Selatan",
    "postalCode": "93860"
  },
  {
    "id": "7414",
    "provinceId": "74",
    "provinceName": "Sulawesi Tenggara",
    "name": "Kabupaten Buton Tengah",
    "postalCode": "93750"
  },
  {
    "id": "7409",
    "provinceId": "74",
    "provinceName": "Sulawesi Tenggara",
    "name": "Kabupaten Buton Utara",
    "postalCode": "93200"
  },
  {
    "id": "3207",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Ciamis",
    "postalCode": "40870"
  },
  {
    "id": "3203",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Cianjur",
    "postalCode": "40430"
  },
  {
    "id": "3301",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Cilacap",
    "postalCode": "50210"
  },
  {
    "id": "3209",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Cirebon",
    "postalCode": "40200"
  },
  {
    "id": "1210",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Dairi",
    "postalCode": "20310"
  },
  {
    "id": "9436",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Deiyai",
    "postalCode": "10500"
  },
  {
    "id": "1212",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Deli Serdang",
    "postalCode": "20530"
  },
  {
    "id": "3321",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Demak",
    "postalCode": "50630"
  },
  {
    "id": "1311",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kabupaten Dharmasraya",
    "postalCode": "25420"
  },
  {
    "id": "9434",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Dogiyai",
    "postalCode": "10280"
  },
  {
    "id": "5205",
    "provinceId": "52",
    "provinceName": "Nusa Tenggara Barat",
    "name": "Kabupaten Dompu",
    "postalCode": "83650"
  },
  {
    "id": "7205",
    "provinceId": "72",
    "provinceName": "Sulawesi Tengah",
    "name": "Kabupaten Donggala",
    "postalCode": "94650"
  },
  {
    "id": "1611",
    "provinceId": "16",
    "provinceName": "Sumatera Selatan",
    "name": "Kabupaten Empat Lawang",
    "postalCode": "30420"
  },
  {
    "id": "5311",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Ende",
    "postalCode": "85420"
  },
  {
    "id": "7316",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Enrekang",
    "postalCode": "90970"
  },
  {
    "id": "9101",
    "provinceId": "91",
    "provinceName": "Papua Barat",
    "name": "Kabupaten Fakfak",
    "postalCode": "99210"
  },
  {
    "id": "5309",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Flores Timur",
    "postalCode": "85200"
  },
  {
    "id": "3205",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Garut",
    "postalCode": "40650"
  },
  {
    "id": "1113",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Gayo Lues",
    "postalCode": "23640"
  },
  {
    "id": "5104",
    "provinceId": "51",
    "provinceName": "Bali",
    "name": "Kabupaten Gianyar",
    "postalCode": "80540"
  },
  {
    "id": "7502",
    "provinceId": "75",
    "provinceName": "Gorontalo",
    "name": "Kabupaten Gorontalo",
    "postalCode": "96320"
  },
  {
    "id": "7505",
    "provinceId": "75",
    "provinceName": "Gorontalo",
    "name": "Kabupaten Gorontalo Utara",
    "postalCode": "96650"
  },
  {
    "id": "7306",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Gowa",
    "postalCode": "90760"
  },
  {
    "id": "3525",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Gresik",
    "postalCode": "60180"
  },
  {
    "id": "3315",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Grobogan",
    "postalCode": "50860"
  },
  {
    "id": "3403",
    "provinceId": "34",
    "provinceName": "DI Yogyakarta",
    "name": "Kabupaten Gunung Kidul",
    "postalCode": "55430"
  },
  {
    "id": "6211",
    "provinceId": "62",
    "provinceName": "Kalimantan Tengah",
    "name": "Kabupaten Gunung Mas",
    "postalCode": "73420"
  },
  {
    "id": "8201",
    "provinceId": "82",
    "provinceName": "Maluku Utara",
    "name": "Kabupaten Halmahera Barat",
    "postalCode": "98210"
  },
  {
    "id": "8204",
    "provinceId": "82",
    "provinceName": "Maluku Utara",
    "name": "Kabupaten Halmahera Selatan",
    "postalCode": "98540"
  },
  {
    "id": "8202",
    "provinceId": "82",
    "provinceName": "Maluku Utara",
    "name": "Kabupaten Halmahera Tengah",
    "postalCode": "98320"
  },
  {
    "id": "8206",
    "provinceId": "82",
    "provinceName": "Maluku Utara",
    "name": "Kabupaten Halmahera Timur",
    "postalCode": "98760"
  },
  {
    "id": "8205",
    "provinceId": "82",
    "provinceName": "Maluku Utara",
    "name": "Kabupaten Halmahera Utara",
    "postalCode": "98650"
  },
  {
    "id": "6306",
    "provinceId": "63",
    "provinceName": "Kalimantan Selatan",
    "name": "Kabupaten Hulu Sungai Selatan",
    "postalCode": "70760"
  },
  {
    "id": "6307",
    "provinceId": "63",
    "provinceName": "Kalimantan Selatan",
    "name": "Kabupaten Hulu Sungai Tengah",
    "postalCode": "70870"
  },
  {
    "id": "6308",
    "provinceId": "63",
    "provinceName": "Kalimantan Selatan",
    "name": "Kabupaten Hulu Sungai Utara",
    "postalCode": "70980"
  },
  {
    "id": "1215",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Humbang Hasundutan",
    "postalCode": "20860"
  },
  {
    "id": "1403",
    "provinceId": "14",
    "provinceName": "Riau",
    "name": "Kabupaten Indragiri Hilir",
    "postalCode": "28430"
  },
  {
    "id": "1402",
    "provinceId": "14",
    "provinceName": "Riau",
    "name": "Kabupaten Indragiri Hulu",
    "postalCode": "28320"
  },
  {
    "id": "3212",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Indramayu",
    "postalCode": "40530"
  },
  {
    "id": "9435",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Intan Jaya",
    "postalCode": "10390"
  },
  {
    "id": "9403",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Jayapura",
    "postalCode": "10430"
  },
  {
    "id": "9402",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Jayawijaya",
    "postalCode": "10320"
  },
  {
    "id": "3509",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Jember",
    "postalCode": "60200"
  },
  {
    "id": "5101",
    "provinceId": "51",
    "provinceName": "Bali",
    "name": "Kabupaten Jembrana",
    "postalCode": "80210"
  },
  {
    "id": "7304",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Jeneponto",
    "postalCode": "90540"
  },
  {
    "id": "3320",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Jepara",
    "postalCode": "50520"
  },
  {
    "id": "3517",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Jombang",
    "postalCode": "60190"
  },
  {
    "id": "9102",
    "provinceId": "91",
    "provinceName": "Papua Barat",
    "name": "Kabupaten Kaimana",
    "postalCode": "99320"
  },
  {
    "id": "1406",
    "provinceId": "14",
    "provinceName": "Riau",
    "name": "Kabupaten Kampar",
    "postalCode": "28760"
  },
  {
    "id": "6203",
    "provinceId": "62",
    "provinceName": "Kalimantan Tengah",
    "name": "Kabupaten Kapuas",
    "postalCode": "73430"
  },
  {
    "id": "6108",
    "provinceId": "61",
    "provinceName": "Kalimantan Barat",
    "name": "Kabupaten Kapuas Hulu",
    "postalCode": "78980"
  },
  {
    "id": "5107",
    "provinceId": "51",
    "provinceName": "Bali",
    "name": "Kabupaten Karang Asem",
    "postalCode": "80870"
  },
  {
    "id": "3313",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Karanganyar",
    "postalCode": "50640"
  },
  {
    "id": "3215",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Karawang",
    "postalCode": "40860"
  },
  {
    "id": "2101",
    "provinceId": "21",
    "provinceName": "Kepulauan Riau",
    "name": "Kabupaten Karimun",
    "postalCode": "29210"
  },
  {
    "id": "1211",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Karo",
    "postalCode": "20420"
  },
  {
    "id": "6209",
    "provinceId": "62",
    "provinceName": "Kalimantan Tengah",
    "name": "Kabupaten Katingan",
    "postalCode": "73200"
  },
  {
    "id": "1704",
    "provinceId": "17",
    "provinceName": "Bengkulu",
    "name": "Kabupaten Kaur",
    "postalCode": "38540"
  },
  {
    "id": "6111",
    "provinceId": "61",
    "provinceName": "Kalimantan Barat",
    "name": "Kabupaten Kayong Utara",
    "postalCode": "78420"
  },
  {
    "id": "3305",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Kebumen",
    "postalCode": "50650"
  },
  {
    "id": "3506",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Kediri",
    "postalCode": "60760"
  },
  {
    "id": "9420",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Keerom",
    "postalCode": "10520"
  },
  {
    "id": "3324",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Kendal",
    "postalCode": "50960"
  },
  {
    "id": "1708",
    "provinceId": "17",
    "provinceName": "Bengkulu",
    "name": "Kabupaten Kepahiang",
    "postalCode": "38980"
  },
  {
    "id": "2105",
    "provinceId": "21",
    "provinceName": "Kepulauan Riau",
    "name": "Kabupaten Kepulauan Anambas",
    "postalCode": "29650"
  },
  {
    "id": "8105",
    "provinceId": "81",
    "provinceName": "Maluku",
    "name": "Kabupaten Kepulauan Aru",
    "postalCode": "97650"
  },
  {
    "id": "1301",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kabupaten Kepulauan Mentawai",
    "postalCode": "25210"
  },
  {
    "id": "1410",
    "provinceId": "14",
    "provinceName": "Riau",
    "name": "Kabupaten Kepulauan Meranti",
    "postalCode": "28310"
  },
  {
    "id": "7103",
    "provinceId": "71",
    "provinceName": "Sulawesi Utara",
    "name": "Kabupaten Kepulauan Sangihe",
    "postalCode": "95430"
  },
  {
    "id": "7301",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Kepulauan Selayar",
    "postalCode": "90210"
  },
  {
    "id": "3101",
    "provinceId": "31",
    "provinceName": "DKI Jakarta",
    "name": "Kabupaten Kepulauan Seribu",
    "postalCode": "14510"
  },
  {
    "id": "8203",
    "provinceId": "82",
    "provinceName": "Maluku Utara",
    "name": "Kabupaten Kepulauan Sula",
    "postalCode": "98430"
  },
  {
    "id": "7104",
    "provinceId": "71",
    "provinceName": "Sulawesi Utara",
    "name": "Kabupaten Kepulauan Talaud",
    "postalCode": "95540"
  },
  {
    "id": "9408",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Kepulauan Yapen",
    "postalCode": "10980"
  },
  {
    "id": "1501",
    "provinceId": "15",
    "provinceName": "Jambi",
    "name": "Kabupaten Kerinci",
    "postalCode": "36210"
  },
  {
    "id": "6106",
    "provinceId": "61",
    "provinceName": "Kalimantan Barat",
    "name": "Kabupaten Ketapang",
    "postalCode": "78760"
  },
  {
    "id": "3310",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Klaten",
    "postalCode": "50310"
  },
  {
    "id": "5105",
    "provinceId": "51",
    "provinceName": "Bali",
    "name": "Kabupaten Klungkung",
    "postalCode": "80650"
  },
  {
    "id": "7404",
    "provinceId": "74",
    "provinceName": "Sulawesi Tenggara",
    "name": "Kabupaten Kolaka",
    "postalCode": "93540"
  },
  {
    "id": "7411",
    "provinceId": "74",
    "provinceName": "Sulawesi Tenggara",
    "name": "Kabupaten Kolaka Timur",
    "postalCode": "93420"
  },
  {
    "id": "7408",
    "provinceId": "74",
    "provinceName": "Sulawesi Tenggara",
    "name": "Kabupaten Kolaka Utara",
    "postalCode": "93980"
  },
  {
    "id": "7403",
    "provinceId": "74",
    "provinceName": "Sulawesi Tenggara",
    "name": "Kabupaten Konawe",
    "postalCode": "93430"
  },
  {
    "id": "7412",
    "provinceId": "74",
    "provinceName": "Sulawesi Tenggara",
    "name": "Kabupaten Konawe Kepulauan",
    "postalCode": "93530"
  },
  {
    "id": "7405",
    "provinceId": "74",
    "provinceName": "Sulawesi Tenggara",
    "name": "Kabupaten Konawe Selatan",
    "postalCode": "93650"
  },
  {
    "id": "7410",
    "provinceId": "74",
    "provinceName": "Sulawesi Tenggara",
    "name": "Kabupaten Konawe Utara",
    "postalCode": "93310"
  },
  {
    "id": "6302",
    "provinceId": "63",
    "provinceName": "Kalimantan Selatan",
    "name": "Kabupaten Kota Baru",
    "postalCode": "70320"
  },
  {
    "id": "6201",
    "provinceId": "62",
    "provinceName": "Kalimantan Tengah",
    "name": "Kabupaten Kotawaringin Barat",
    "postalCode": "73210"
  },
  {
    "id": "6202",
    "provinceId": "62",
    "provinceName": "Kalimantan Tengah",
    "name": "Kabupaten Kotawaringin Timur",
    "postalCode": "73320"
  },
  {
    "id": "1401",
    "provinceId": "14",
    "provinceName": "Riau",
    "name": "Kabupaten Kuantan Singingi",
    "postalCode": "28210"
  },
  {
    "id": "6112",
    "provinceId": "61",
    "provinceName": "Kalimantan Barat",
    "name": "Kabupaten Kubu Raya",
    "postalCode": "78530"
  },
  {
    "id": "3319",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Kudus",
    "postalCode": "50410"
  },
  {
    "id": "3401",
    "provinceId": "34",
    "provinceName": "DI Yogyakarta",
    "name": "Kabupaten Kulon Progo",
    "postalCode": "55210"
  },
  {
    "id": "3208",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Kuningan",
    "postalCode": "40980"
  },
  {
    "id": "5303",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Kupang",
    "postalCode": "85430"
  },
  {
    "id": "6402",
    "provinceId": "64",
    "provinceName": "Kalimantan Timur",
    "name": "Kabupaten Kutai Barat",
    "postalCode": "75320"
  },
  {
    "id": "6403",
    "provinceId": "64",
    "provinceName": "Kalimantan Timur",
    "name": "Kabupaten Kutai Kartanegara",
    "postalCode": "75430"
  },
  {
    "id": "6404",
    "provinceId": "64",
    "provinceName": "Kalimantan Timur",
    "name": "Kabupaten Kutai Timur",
    "postalCode": "75540"
  },
  {
    "id": "1207",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Labuhan Batu",
    "postalCode": "20870"
  },
  {
    "id": "1222",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Labuhan Batu Selatan",
    "postalCode": "20740"
  },
  {
    "id": "1223",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Labuhan Batu Utara",
    "postalCode": "20850"
  },
  {
    "id": "1604",
    "provinceId": "16",
    "provinceName": "Sumatera Selatan",
    "name": "Kabupaten Lahat",
    "postalCode": "30540"
  },
  {
    "id": "6207",
    "provinceId": "62",
    "provinceName": "Kalimantan Tengah",
    "name": "Kabupaten Lamandau",
    "postalCode": "73870"
  },
  {
    "id": "3524",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Lamongan",
    "postalCode": "60960"
  },
  {
    "id": "1801",
    "provinceId": "18",
    "provinceName": "Lampung",
    "name": "Kabupaten Lampung Barat",
    "postalCode": "35210"
  },
  {
    "id": "1803",
    "provinceId": "18",
    "provinceName": "Lampung",
    "name": "Kabupaten Lampung Selatan",
    "postalCode": "35430"
  },
  {
    "id": "1805",
    "provinceId": "18",
    "provinceName": "Lampung",
    "name": "Kabupaten Lampung Tengah",
    "postalCode": "35650"
  },
  {
    "id": "1804",
    "provinceId": "18",
    "provinceName": "Lampung",
    "name": "Kabupaten Lampung Timur",
    "postalCode": "35540"
  },
  {
    "id": "1806",
    "provinceId": "18",
    "provinceName": "Lampung",
    "name": "Kabupaten Lampung Utara",
    "postalCode": "35760"
  },
  {
    "id": "6103",
    "provinceId": "61",
    "provinceName": "Kalimantan Barat",
    "name": "Kabupaten Landak",
    "postalCode": "78430"
  },
  {
    "id": "1213",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Langkat",
    "postalCode": "20640"
  },
  {
    "id": "9430",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Lanny Jaya",
    "postalCode": "10730"
  },
  {
    "id": "3602",
    "provinceId": "36",
    "provinceName": "Banten",
    "name": "Kabupaten Lebak",
    "postalCode": "15320"
  },
  {
    "id": "1707",
    "provinceId": "17",
    "provinceName": "Bengkulu",
    "name": "Kabupaten Lebong",
    "postalCode": "38870"
  },
  {
    "id": "5308",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Lembata",
    "postalCode": "85980"
  },
  {
    "id": "1308",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kabupaten Lima Puluh Kota",
    "postalCode": "25980"
  },
  {
    "id": "2104",
    "provinceId": "21",
    "provinceName": "Kepulauan Riau",
    "name": "Kabupaten Lingga",
    "postalCode": "29540"
  },
  {
    "id": "5201",
    "provinceId": "52",
    "provinceName": "Nusa Tenggara Barat",
    "name": "Kabupaten Lombok Barat",
    "postalCode": "83210"
  },
  {
    "id": "5202",
    "provinceId": "52",
    "provinceName": "Nusa Tenggara Barat",
    "name": "Kabupaten Lombok Tengah",
    "postalCode": "83320"
  },
  {
    "id": "5203",
    "provinceId": "52",
    "provinceName": "Nusa Tenggara Barat",
    "name": "Kabupaten Lombok Timur",
    "postalCode": "83430"
  },
  {
    "id": "5208",
    "provinceId": "52",
    "provinceName": "Nusa Tenggara Barat",
    "name": "Kabupaten Lombok Utara",
    "postalCode": "83980"
  },
  {
    "id": "3508",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Lumajang",
    "postalCode": "60980"
  },
  {
    "id": "7317",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Luwu",
    "postalCode": "90190"
  },
  {
    "id": "7325",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Luwu Timur",
    "postalCode": "90180"
  },
  {
    "id": "7322",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Luwu Utara",
    "postalCode": "90740"
  },
  {
    "id": "3519",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Madiun",
    "postalCode": "60410"
  },
  {
    "id": "3308",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Magelang",
    "postalCode": "50980"
  },
  {
    "id": "3520",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Magetan",
    "postalCode": "60520"
  },
  {
    "id": "6411",
    "provinceId": "64",
    "provinceName": "Kalimantan Timur",
    "name": "Kabupaten Mahakam Hulu",
    "postalCode": "75420"
  },
  {
    "id": "3210",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Majalengka",
    "postalCode": "40310"
  },
  {
    "id": "7601",
    "provinceId": "76",
    "provinceName": "Sulawesi Barat",
    "name": "Kabupaten Majene",
    "postalCode": "91210"
  },
  {
    "id": "5321",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Malaka",
    "postalCode": "85630"
  },
  {
    "id": "3507",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Malang",
    "postalCode": "60870"
  },
  {
    "id": "6501",
    "provinceId": "65",
    "provinceName": "Kalimantan Utara",
    "name": "Kabupaten Malinau",
    "postalCode": "77210"
  },
  {
    "id": "8108",
    "provinceId": "81",
    "provinceName": "Maluku",
    "name": "Kabupaten Maluku Barat Daya",
    "postalCode": "97980"
  },
  {
    "id": "8103",
    "provinceId": "81",
    "provinceName": "Maluku",
    "name": "Kabupaten Maluku Tengah",
    "postalCode": "97430"
  },
  {
    "id": "8102",
    "provinceId": "81",
    "provinceName": "Maluku",
    "name": "Kabupaten Maluku Tenggara",
    "postalCode": "97320"
  },
  {
    "id": "8101",
    "provinceId": "81",
    "provinceName": "Maluku",
    "name": "Kabupaten Maluku Tenggara Barat",
    "postalCode": "97210"
  },
  {
    "id": "7603",
    "provinceId": "76",
    "provinceName": "Sulawesi Barat",
    "name": "Kabupaten Mamasa",
    "postalCode": "91430"
  },
  {
    "id": "9428",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Mamberamo Raya",
    "postalCode": "10510"
  },
  {
    "id": "9431",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Mamberamo Tengah",
    "postalCode": "10840"
  },
  {
    "id": "7604",
    "provinceId": "76",
    "provinceName": "Sulawesi Barat",
    "name": "Kabupaten Mamuju",
    "postalCode": "91540"
  },
  {
    "id": "7606",
    "provinceId": "76",
    "provinceName": "Sulawesi Barat",
    "name": "Kabupaten Mamuju Tengah",
    "postalCode": "91760"
  },
  {
    "id": "7605",
    "provinceId": "76",
    "provinceName": "Sulawesi Barat",
    "name": "Kabupaten Mamuju Utara",
    "postalCode": "91650"
  },
  {
    "id": "1202",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Mandailing Natal",
    "postalCode": "20320"
  },
  {
    "id": "5313",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Manggarai",
    "postalCode": "85640"
  },
  {
    "id": "5315",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Manggarai Barat",
    "postalCode": "85860"
  },
  {
    "id": "5319",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Manggarai Timur",
    "postalCode": "85410"
  },
  {
    "id": "9105",
    "provinceId": "91",
    "provinceName": "Papua Barat",
    "name": "Kabupaten Manokwari",
    "postalCode": "99650"
  },
  {
    "id": "9111",
    "provinceId": "91",
    "provinceName": "Papua Barat",
    "name": "Kabupaten Manokwari Selatan",
    "postalCode": "99420"
  },
  {
    "id": "9414",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Mappi",
    "postalCode": "10750"
  },
  {
    "id": "7308",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Maros",
    "postalCode": "90980"
  },
  {
    "id": "9110",
    "provinceId": "91",
    "provinceName": "Papua Barat",
    "name": "Kabupaten Maybrat",
    "postalCode": "99310"
  },
  {
    "id": "6110",
    "provinceId": "61",
    "provinceName": "Kalimantan Barat",
    "name": "Kabupaten Melawi",
    "postalCode": "78310"
  },
  {
    "id": "6104",
    "provinceId": "61",
    "provinceName": "Kalimantan Barat",
    "name": "Kabupaten Mempawah",
    "postalCode": "78540"
  },
  {
    "id": "1502",
    "provinceId": "15",
    "provinceName": "Jambi",
    "name": "Kabupaten Merangin",
    "postalCode": "36320"
  },
  {
    "id": "9401",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Merauke",
    "postalCode": "10210"
  },
  {
    "id": "1811",
    "provinceId": "18",
    "provinceName": "Lampung",
    "name": "Kabupaten Mesuji",
    "postalCode": "35420"
  },
  {
    "id": "9412",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Mimika",
    "postalCode": "10530"
  },
  {
    "id": "7102",
    "provinceId": "71",
    "provinceName": "Sulawesi Utara",
    "name": "Kabupaten Minahasa",
    "postalCode": "95320"
  },
  {
    "id": "7105",
    "provinceId": "71",
    "provinceName": "Sulawesi Utara",
    "name": "Kabupaten Minahasa Selatan",
    "postalCode": "95650"
  },
  {
    "id": "7109",
    "provinceId": "71",
    "provinceName": "Sulawesi Utara",
    "name": "Kabupaten Minahasa Tenggara",
    "postalCode": "95200"
  },
  {
    "id": "7106",
    "provinceId": "71",
    "provinceName": "Sulawesi Utara",
    "name": "Kabupaten Minahasa Utara",
    "postalCode": "95760"
  },
  {
    "id": "3516",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Mojokerto",
    "postalCode": "60970"
  },
  {
    "id": "7203",
    "provinceId": "72",
    "provinceName": "Sulawesi Tengah",
    "name": "Kabupaten Morowali",
    "postalCode": "94430"
  },
  {
    "id": "7212",
    "provinceId": "72",
    "provinceName": "Sulawesi Tengah",
    "name": "Kabupaten Morowali Utara",
    "postalCode": "94530"
  },
  {
    "id": "1603",
    "provinceId": "16",
    "provinceName": "Sumatera Selatan",
    "name": "Kabupaten Muara Enim",
    "postalCode": "30430"
  },
  {
    "id": "1505",
    "provinceId": "15",
    "provinceName": "Jambi",
    "name": "Kabupaten Muaro Jambi",
    "postalCode": "36650"
  },
  {
    "id": "1706",
    "provinceId": "17",
    "provinceName": "Bengkulu",
    "name": "Kabupaten Mukomuko",
    "postalCode": "38760"
  },
  {
    "id": "7402",
    "provinceId": "74",
    "provinceName": "Sulawesi Tenggara",
    "name": "Kabupaten Muna",
    "postalCode": "93320"
  },
  {
    "id": "7413",
    "provinceId": "74",
    "provinceName": "Sulawesi Tenggara",
    "name": "Kabupaten Muna Barat",
    "postalCode": "93640"
  },
  {
    "id": "6213",
    "provinceId": "62",
    "provinceName": "Kalimantan Tengah",
    "name": "Kabupaten Murung Raya",
    "postalCode": "73640"
  },
  {
    "id": "1606",
    "provinceId": "16",
    "provinceName": "Sumatera Selatan",
    "name": "Kabupaten Musi Banyuasin",
    "postalCode": "30760"
  },
  {
    "id": "1605",
    "provinceId": "16",
    "provinceName": "Sumatera Selatan",
    "name": "Kabupaten Musi Rawas",
    "postalCode": "30650"
  },
  {
    "id": "1613",
    "provinceId": "16",
    "provinceName": "Sumatera Selatan",
    "name": "Kabupaten Musi Rawas Utara",
    "postalCode": "30640"
  },
  {
    "id": "9404",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Nabire",
    "postalCode": "10540"
  },
  {
    "id": "1115",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Nagan Raya",
    "postalCode": "23860"
  },
  {
    "id": "5318",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Nagekeo",
    "postalCode": "85300"
  },
  {
    "id": "2103",
    "provinceId": "21",
    "provinceName": "Kepulauan Riau",
    "name": "Kabupaten Natuna",
    "postalCode": "29430"
  },
  {
    "id": "9429",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Nduga",
    "postalCode": "10620"
  },
  {
    "id": "5312",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Ngada",
    "postalCode": "85530"
  },
  {
    "id": "3518",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Nganjuk",
    "postalCode": "60300"
  },
  {
    "id": "3521",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Ngawi",
    "postalCode": "60630"
  },
  {
    "id": "1201",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Nias",
    "postalCode": "20210"
  },
  {
    "id": "1225",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Nias Barat",
    "postalCode": "20180"
  },
  {
    "id": "1214",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Nias Selatan",
    "postalCode": "20750"
  },
  {
    "id": "1224",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Nias Utara",
    "postalCode": "20960"
  },
  {
    "id": "6504",
    "provinceId": "65",
    "provinceName": "Kalimantan Utara",
    "name": "Kabupaten Nunukan",
    "postalCode": "77540"
  },
  {
    "id": "1610",
    "provinceId": "16",
    "provinceName": "Sumatera Selatan",
    "name": "Kabupaten Ogan Ilir",
    "postalCode": "30310"
  },
  {
    "id": "1602",
    "provinceId": "16",
    "provinceName": "Sumatera Selatan",
    "name": "Kabupaten Ogan Komering Ilir",
    "postalCode": "30320"
  },
  {
    "id": "1601",
    "provinceId": "16",
    "provinceName": "Sumatera Selatan",
    "name": "Kabupaten Ogan Komering Ulu",
    "postalCode": "30210"
  },
  {
    "id": "1608",
    "provinceId": "16",
    "provinceName": "Sumatera Selatan",
    "name": "Kabupaten Ogan Komering Ulu Selatan",
    "postalCode": "30980"
  },
  {
    "id": "1609",
    "provinceId": "16",
    "provinceName": "Sumatera Selatan",
    "name": "Kabupaten Ogan Komering Ulu Timur",
    "postalCode": "30200"
  },
  {
    "id": "3501",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Pacitan",
    "postalCode": "60210"
  },
  {
    "id": "1221",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Padang Lawas",
    "postalCode": "20630"
  },
  {
    "id": "1220",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Padang Lawas Utara",
    "postalCode": "20520"
  },
  {
    "id": "1306",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kabupaten Padang Pariaman",
    "postalCode": "25760"
  },
  {
    "id": "1216",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Pakpak Bharat",
    "postalCode": "20970"
  },
  {
    "id": "3528",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Pamekasan",
    "postalCode": "60510"
  },
  {
    "id": "3601",
    "provinceId": "36",
    "provinceName": "Banten",
    "name": "Kabupaten Pandeglang",
    "postalCode": "15210"
  },
  {
    "id": "3218",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Pangandaran",
    "postalCode": "40300"
  },
  {
    "id": "7309",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Pangkajene Dan Kepulauan",
    "postalCode": "90200"
  },
  {
    "id": "9410",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Paniai",
    "postalCode": "10310"
  },
  {
    "id": "7208",
    "provinceId": "72",
    "provinceName": "Sulawesi Tengah",
    "name": "Kabupaten Parigi Moutong",
    "postalCode": "94980"
  },
  {
    "id": "1309",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kabupaten Pasaman",
    "postalCode": "25200"
  },
  {
    "id": "1312",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kabupaten Pasaman Barat",
    "postalCode": "25530"
  },
  {
    "id": "6401",
    "provinceId": "64",
    "provinceName": "Kalimantan Timur",
    "name": "Kabupaten Paser",
    "postalCode": "75210"
  },
  {
    "id": "3514",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Pasuruan",
    "postalCode": "60750"
  },
  {
    "id": "3318",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Pati",
    "postalCode": "50300"
  },
  {
    "id": "9112",
    "provinceId": "91",
    "provinceName": "Papua Barat",
    "name": "Kabupaten Pegunungan Arfak",
    "postalCode": "99530"
  },
  {
    "id": "9417",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Pegunungan Bintang",
    "postalCode": "10190"
  },
  {
    "id": "3326",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Pekalongan",
    "postalCode": "50290"
  },
  {
    "id": "1404",
    "provinceId": "14",
    "provinceName": "Riau",
    "name": "Kabupaten Pelalawan",
    "postalCode": "28540"
  },
  {
    "id": "3327",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Pemalang",
    "postalCode": "50400"
  },
  {
    "id": "6409",
    "provinceId": "64",
    "provinceName": "Kalimantan Timur",
    "name": "Kabupaten Penajam Paser Utara",
    "postalCode": "75200"
  },
  {
    "id": "1612",
    "provinceId": "16",
    "provinceName": "Sumatera Selatan",
    "name": "Kabupaten Penukal Abab Lematang Ilir",
    "postalCode": "30530"
  },
  {
    "id": "1809",
    "provinceId": "18",
    "provinceName": "Lampung",
    "name": "Kabupaten Pesawaran",
    "postalCode": "35200"
  },
  {
    "id": "1813",
    "provinceId": "18",
    "provinceName": "Lampung",
    "name": "Kabupaten Pesisir Barat",
    "postalCode": "35640"
  },
  {
    "id": "1302",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kabupaten Pesisir Selatan",
    "postalCode": "25320"
  },
  {
    "id": "1109",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Pidie",
    "postalCode": "23200"
  },
  {
    "id": "1118",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Pidie Jaya",
    "postalCode": "23300"
  },
  {
    "id": "7315",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Pinrang",
    "postalCode": "90860"
  },
  {
    "id": "7503",
    "provinceId": "75",
    "provinceName": "Gorontalo",
    "name": "Kabupaten Pohuwato",
    "postalCode": "96430"
  },
  {
    "id": "7602",
    "provinceId": "76",
    "provinceName": "Sulawesi Barat",
    "name": "Kabupaten Polewali Mandar",
    "postalCode": "91320"
  },
  {
    "id": "3502",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Ponorogo",
    "postalCode": "60320"
  },
  {
    "id": "7204",
    "provinceId": "72",
    "provinceName": "Sulawesi Tengah",
    "name": "Kabupaten Poso",
    "postalCode": "94540"
  },
  {
    "id": "1810",
    "provinceId": "18",
    "provinceName": "Lampung",
    "name": "Kabupaten Pringsewu",
    "postalCode": "35310"
  },
  {
    "id": "3513",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Probolinggo",
    "postalCode": "60640"
  },
  {
    "id": "6210",
    "provinceId": "62",
    "provinceName": "Kalimantan Tengah",
    "name": "Kabupaten Pulang Pisau",
    "postalCode": "73310"
  },
  {
    "id": "8207",
    "provinceId": "82",
    "provinceName": "Maluku Utara",
    "name": "Kabupaten Pulau Morotai",
    "postalCode": "98870"
  },
  {
    "id": "8208",
    "provinceId": "82",
    "provinceName": "Maluku Utara",
    "name": "Kabupaten Pulau Taliabu",
    "postalCode": "98980"
  },
  {
    "id": "9433",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Puncak",
    "postalCode": "10170"
  },
  {
    "id": "9411",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Puncak Jaya",
    "postalCode": "10420"
  },
  {
    "id": "3303",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Purbalingga",
    "postalCode": "50430"
  },
  {
    "id": "3214",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Purwakarta",
    "postalCode": "40750"
  },
  {
    "id": "3306",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Purworejo",
    "postalCode": "50760"
  },
  {
    "id": "9108",
    "provinceId": "91",
    "provinceName": "Papua Barat",
    "name": "Kabupaten Raja Ampat",
    "postalCode": "99980"
  },
  {
    "id": "1702",
    "provinceId": "17",
    "provinceName": "Bengkulu",
    "name": "Kabupaten Rejang Lebong",
    "postalCode": "38320"
  },
  {
    "id": "3317",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Rembang",
    "postalCode": "50190"
  },
  {
    "id": "1409",
    "provinceId": "14",
    "provinceName": "Riau",
    "name": "Kabupaten Rokan Hilir",
    "postalCode": "28200"
  },
  {
    "id": "1407",
    "provinceId": "14",
    "provinceName": "Riau",
    "name": "Kabupaten Rokan Hulu",
    "postalCode": "28870"
  },
  {
    "id": "5314",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Rote Ndao",
    "postalCode": "85750"
  },
  {
    "id": "1405",
    "provinceId": "14",
    "provinceName": "Riau",
    "name": "Kabupaten S I A K",
    "postalCode": "28650"
  },
  {
    "id": "5320",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Sabu Raijua",
    "postalCode": "85520"
  },
  {
    "id": "6101",
    "provinceId": "61",
    "provinceName": "Kalimantan Barat",
    "name": "Kabupaten Sambas",
    "postalCode": "78210"
  },
  {
    "id": "1217",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Samosir",
    "postalCode": "20190"
  },
  {
    "id": "3527",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Sampang",
    "postalCode": "60400"
  },
  {
    "id": "6105",
    "provinceId": "61",
    "provinceName": "Kalimantan Barat",
    "name": "Kabupaten Sanggau",
    "postalCode": "78650"
  },
  {
    "id": "9419",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Sarmi",
    "postalCode": "10410"
  },
  {
    "id": "1503",
    "provinceId": "15",
    "provinceName": "Jambi",
    "name": "Kabupaten Sarolangun",
    "postalCode": "36430"
  },
  {
    "id": "6109",
    "provinceId": "61",
    "provinceName": "Kalimantan Barat",
    "name": "Kabupaten Sekadau",
    "postalCode": "78200"
  },
  {
    "id": "1705",
    "provinceId": "17",
    "provinceName": "Bengkulu",
    "name": "Kabupaten Seluma",
    "postalCode": "38650"
  },
  {
    "id": "3322",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Semarang",
    "postalCode": "50740"
  },
  {
    "id": "8106",
    "provinceId": "81",
    "provinceName": "Maluku",
    "name": "Kabupaten Seram Bagian Barat",
    "postalCode": "97760"
  },
  {
    "id": "8107",
    "provinceId": "81",
    "provinceName": "Maluku",
    "name": "Kabupaten Seram Bagian Timur",
    "postalCode": "97870"
  },
  {
    "id": "3604",
    "provinceId": "36",
    "provinceName": "Banten",
    "name": "Kabupaten Serang",
    "postalCode": "15540"
  },
  {
    "id": "1218",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Serdang Bedagai",
    "postalCode": "20300"
  },
  {
    "id": "6208",
    "provinceId": "62",
    "provinceName": "Kalimantan Tengah",
    "name": "Kabupaten Seruyan",
    "postalCode": "73980"
  },
  {
    "id": "7108",
    "provinceId": "71",
    "provinceName": "Sulawesi Utara",
    "name": "Kabupaten Siau Tagulandang Biaro",
    "postalCode": "95980"
  },
  {
    "id": "7314",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Sidenreng Rappang",
    "postalCode": "90750"
  },
  {
    "id": "3515",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Sidoarjo",
    "postalCode": "60860"
  },
  {
    "id": "7210",
    "provinceId": "72",
    "provinceName": "Sulawesi Tengah",
    "name": "Kabupaten Sigi",
    "postalCode": "94310"
  },
  {
    "id": "1304",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kabupaten Sijunjung",
    "postalCode": "25540"
  },
  {
    "id": "5310",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Sikka",
    "postalCode": "85310"
  },
  {
    "id": "1209",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Simalungun",
    "postalCode": "20200"
  },
  {
    "id": "1101",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kabupaten Simeulue",
    "postalCode": "23891"
  },
  {
    "id": "7307",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Sinjai",
    "postalCode": "90870"
  },
  {
    "id": "6107",
    "provinceId": "61",
    "provinceName": "Kalimantan Barat",
    "name": "Kabupaten Sintang",
    "postalCode": "78870"
  },
  {
    "id": "3512",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Situbondo",
    "postalCode": "60530"
  },
  {
    "id": "3404",
    "provinceId": "34",
    "provinceName": "DI Yogyakarta",
    "name": "Kabupaten Sleman",
    "postalCode": "55540"
  },
  {
    "id": "1303",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kabupaten Solok",
    "postalCode": "25430"
  },
  {
    "id": "1310",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kabupaten Solok Selatan",
    "postalCode": "25310"
  },
  {
    "id": "7312",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Soppeng",
    "postalCode": "90530"
  },
  {
    "id": "9107",
    "provinceId": "91",
    "provinceName": "Papua Barat",
    "name": "Kabupaten Sorong",
    "postalCode": "99870"
  },
  {
    "id": "9106",
    "provinceId": "91",
    "provinceName": "Papua Barat",
    "name": "Kabupaten Sorong Selatan",
    "postalCode": "99760"
  },
  {
    "id": "3314",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Sragen",
    "postalCode": "50750"
  },
  {
    "id": "3213",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Subang",
    "postalCode": "40640"
  },
  {
    "id": "3202",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Sukabumi",
    "postalCode": "40320"
  },
  {
    "id": "6206",
    "provinceId": "62",
    "provinceName": "Kalimantan Tengah",
    "name": "Kabupaten Sukamara",
    "postalCode": "73760"
  },
  {
    "id": "3311",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Sukoharjo",
    "postalCode": "50420"
  },
  {
    "id": "5301",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Sumba Barat",
    "postalCode": "85210"
  },
  {
    "id": "5317",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Sumba Barat Daya",
    "postalCode": "85190"
  },
  {
    "id": "5316",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Sumba Tengah",
    "postalCode": "85970"
  },
  {
    "id": "5302",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Sumba Timur",
    "postalCode": "85320"
  },
  {
    "id": "5204",
    "provinceId": "52",
    "provinceName": "Nusa Tenggara Barat",
    "name": "Kabupaten Sumbawa",
    "postalCode": "83540"
  },
  {
    "id": "5207",
    "provinceId": "52",
    "provinceName": "Nusa Tenggara Barat",
    "name": "Kabupaten Sumbawa Barat",
    "postalCode": "83870"
  },
  {
    "id": "3211",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Sumedang",
    "postalCode": "40420"
  },
  {
    "id": "3529",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Sumenep",
    "postalCode": "60620"
  },
  {
    "id": "9427",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Supiori",
    "postalCode": "10400"
  },
  {
    "id": "6309",
    "provinceId": "63",
    "provinceName": "Kalimantan Selatan",
    "name": "Kabupaten Tabalong",
    "postalCode": "70200"
  },
  {
    "id": "5102",
    "provinceId": "51",
    "provinceName": "Bali",
    "name": "Kabupaten Tabanan",
    "postalCode": "80320"
  },
  {
    "id": "7305",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Takalar",
    "postalCode": "90650"
  },
  {
    "id": "9109",
    "provinceId": "91",
    "provinceName": "Papua Barat",
    "name": "Kabupaten Tambrauw",
    "postalCode": "99200"
  },
  {
    "id": "6503",
    "provinceId": "65",
    "provinceName": "Kalimantan Utara",
    "name": "Kabupaten Tana Tidung",
    "postalCode": "77430"
  },
  {
    "id": "7318",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Tana Toraja",
    "postalCode": "90300"
  },
  {
    "id": "6310",
    "provinceId": "63",
    "provinceName": "Kalimantan Selatan",
    "name": "Kabupaten Tanah Bumbu",
    "postalCode": "70310"
  },
  {
    "id": "1305",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kabupaten Tanah Datar",
    "postalCode": "25650"
  },
  {
    "id": "6301",
    "provinceId": "63",
    "provinceName": "Kalimantan Selatan",
    "name": "Kabupaten Tanah Laut",
    "postalCode": "70210"
  },
  {
    "id": "3603",
    "provinceId": "36",
    "provinceName": "Banten",
    "name": "Kabupaten Tangerang",
    "postalCode": "15430"
  },
  {
    "id": "1802",
    "provinceId": "18",
    "provinceName": "Lampung",
    "name": "Kabupaten Tanggamus",
    "postalCode": "35320"
  },
  {
    "id": "1507",
    "provinceId": "15",
    "provinceName": "Jambi",
    "name": "Kabupaten Tanjung Jabung Barat",
    "postalCode": "36870"
  },
  {
    "id": "1506",
    "provinceId": "15",
    "provinceName": "Jambi",
    "name": "Kabupaten Tanjung Jabung Timur",
    "postalCode": "36760"
  },
  {
    "id": "1203",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Tapanuli Selatan",
    "postalCode": "20430"
  },
  {
    "id": "1204",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Tapanuli Tengah",
    "postalCode": "20540"
  },
  {
    "id": "1205",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Tapanuli Utara",
    "postalCode": "20650"
  },
  {
    "id": "6305",
    "provinceId": "63",
    "provinceName": "Kalimantan Selatan",
    "name": "Kabupaten Tapin",
    "postalCode": "70650"
  },
  {
    "id": "3206",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kabupaten Tasikmalaya",
    "postalCode": "40760"
  },
  {
    "id": "1508",
    "provinceId": "15",
    "provinceName": "Jambi",
    "name": "Kabupaten Tebo",
    "postalCode": "36980"
  },
  {
    "id": "3328",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Tegal",
    "postalCode": "50510"
  },
  {
    "id": "9104",
    "provinceId": "91",
    "provinceName": "Papua Barat",
    "name": "Kabupaten Teluk Bintuni",
    "postalCode": "99540"
  },
  {
    "id": "9103",
    "provinceId": "91",
    "provinceName": "Papua Barat",
    "name": "Kabupaten Teluk Wondama",
    "postalCode": "99430"
  },
  {
    "id": "3323",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Temanggung",
    "postalCode": "50850"
  },
  {
    "id": "5304",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Timor Tengah Selatan",
    "postalCode": "85540"
  },
  {
    "id": "5305",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kabupaten Timor Tengah Utara",
    "postalCode": "85650"
  },
  {
    "id": "1206",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kabupaten Toba Samosir",
    "postalCode": "20760"
  },
  {
    "id": "7209",
    "provinceId": "72",
    "provinceName": "Sulawesi Tengah",
    "name": "Kabupaten Tojo Una-una",
    "postalCode": "94200"
  },
  {
    "id": "7206",
    "provinceId": "72",
    "provinceName": "Sulawesi Tengah",
    "name": "Kabupaten Toli-toli",
    "postalCode": "94760"
  },
  {
    "id": "9418",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Tolikara",
    "postalCode": "10300"
  },
  {
    "id": "7326",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Toraja Utara",
    "postalCode": "90290"
  },
  {
    "id": "3503",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Trenggalek",
    "postalCode": "60430"
  },
  {
    "id": "3523",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Tuban",
    "postalCode": "60850"
  },
  {
    "id": "1812",
    "provinceId": "18",
    "provinceName": "Lampung",
    "name": "Kabupaten Tulang Bawang Barat",
    "postalCode": "35530"
  },
  {
    "id": "1808",
    "provinceId": "18",
    "provinceName": "Lampung",
    "name": "Kabupaten Tulangbawang",
    "postalCode": "35980"
  },
  {
    "id": "3504",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kabupaten Tulungagung",
    "postalCode": "60540"
  },
  {
    "id": "7313",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kabupaten Wajo",
    "postalCode": "90640"
  },
  {
    "id": "7407",
    "provinceId": "74",
    "provinceName": "Sulawesi Tenggara",
    "name": "Kabupaten Wakatobi",
    "postalCode": "93870"
  },
  {
    "id": "9426",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Waropen",
    "postalCode": "10290"
  },
  {
    "id": "1807",
    "provinceId": "18",
    "provinceName": "Lampung",
    "name": "Kabupaten Way Kanan",
    "postalCode": "35870"
  },
  {
    "id": "3312",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Wonogiri",
    "postalCode": "50530"
  },
  {
    "id": "3307",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kabupaten Wonosobo",
    "postalCode": "50870"
  },
  {
    "id": "9416",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Yahukimo",
    "postalCode": "10970"
  },
  {
    "id": "9432",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kabupaten Yalimo",
    "postalCode": "10950"
  },
  {
    "id": "8171",
    "provinceId": "81",
    "provinceName": "Maluku",
    "name": "Kota Ambon",
    "postalCode": "97111"
  },
  {
    "id": "2171",
    "provinceId": "21",
    "provinceName": "Kepulauan Riau",
    "name": "Kota B A T A M",
    "postalCode": "29411"
  },
  {
    "id": "6471",
    "provinceId": "64",
    "provinceName": "Kalimantan Timur",
    "name": "Kota Balikpapan",
    "postalCode": "76111"
  },
  {
    "id": "1171",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kota Banda Aceh",
    "postalCode": "23111"
  },
  {
    "id": "1871",
    "provinceId": "18",
    "provinceName": "Lampung",
    "name": "Kota Bandar Lampung",
    "postalCode": "35111"
  },
  {
    "id": "3273",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kota Bandung",
    "postalCode": "40111"
  },
  {
    "id": "3279",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kota Banjar",
    "postalCode": "46311"
  },
  {
    "id": "6372",
    "provinceId": "63",
    "provinceName": "Kalimantan Selatan",
    "name": "Kota Banjar Baru",
    "postalCode": "70711"
  },
  {
    "id": "6371",
    "provinceId": "63",
    "provinceName": "Kalimantan Selatan",
    "name": "Kota Banjarmasin",
    "postalCode": "70111"
  },
  {
    "id": "3579",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kota Batu",
    "postalCode": "65311"
  },
  {
    "id": "7472",
    "provinceId": "74",
    "provinceName": "Sulawesi Tenggara",
    "name": "Kota Baubau",
    "postalCode": "93711"
  },
  {
    "id": "3275",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kota Bekasi",
    "postalCode": "17111"
  },
  {
    "id": "1771",
    "provinceId": "17",
    "provinceName": "Bengkulu",
    "name": "Kota Bengkulu",
    "postalCode": "38111"
  },
  {
    "id": "5272",
    "provinceId": "52",
    "provinceName": "Nusa Tenggara Barat",
    "name": "Kota Bima",
    "postalCode": "84111"
  },
  {
    "id": "1276",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kota Binjai",
    "postalCode": "20450"
  },
  {
    "id": "7172",
    "provinceId": "71",
    "provinceName": "Sulawesi Utara",
    "name": "Kota Bitung",
    "postalCode": "95511"
  },
  {
    "id": "3572",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kota Blitar",
    "postalCode": "66111"
  },
  {
    "id": "3271",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kota Bogor",
    "postalCode": "16111"
  },
  {
    "id": "6474",
    "provinceId": "64",
    "provinceName": "Kalimantan Timur",
    "name": "Kota Bontang",
    "postalCode": "75311"
  },
  {
    "id": "1375",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kota Bukittinggi",
    "postalCode": "26111"
  },
  {
    "id": "3672",
    "provinceId": "36",
    "provinceName": "Banten",
    "name": "Kota Cilegon",
    "postalCode": "42411"
  },
  {
    "id": "3277",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kota Cimahi",
    "postalCode": "40511"
  },
  {
    "id": "3274",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kota Cirebon",
    "postalCode": "45111"
  },
  {
    "id": "1473",
    "provinceId": "14",
    "provinceName": "Riau",
    "name": "Kota D U M A I",
    "postalCode": "28120"
  },
  {
    "id": "5171",
    "provinceId": "51",
    "provinceName": "Bali",
    "name": "Kota Denpasar",
    "postalCode": "80111"
  },
  {
    "id": "3276",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kota Depok",
    "postalCode": "16411"
  },
  {
    "id": "7571",
    "provinceId": "75",
    "provinceName": "Gorontalo",
    "name": "Kota Gorontalo",
    "postalCode": "96111"
  },
  {
    "id": "1278",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kota Gunungsitoli",
    "postalCode": "20670"
  },
  {
    "id": "3174",
    "provinceId": "31",
    "provinceName": "DKI Jakarta",
    "name": "Kota Jakarta Barat",
    "postalCode": "12110"
  },
  {
    "id": "3173",
    "provinceId": "31",
    "provinceName": "DKI Jakarta",
    "name": "Kota Jakarta Pusat",
    "postalCode": "11220"
  },
  {
    "id": "3171",
    "provinceId": "31",
    "provinceName": "DKI Jakarta",
    "name": "Kota Jakarta Selatan",
    "postalCode": "10110"
  },
  {
    "id": "3172",
    "provinceId": "31",
    "provinceName": "DKI Jakarta",
    "name": "Kota Jakarta Timur",
    "postalCode": "14110"
  },
  {
    "id": "3175",
    "provinceId": "31",
    "provinceName": "DKI Jakarta",
    "name": "Kota Jakarta Utara",
    "postalCode": "13110"
  },
  {
    "id": "1571",
    "provinceId": "15",
    "provinceName": "Jambi",
    "name": "Kota Jambi",
    "postalCode": "36111"
  },
  {
    "id": "9471",
    "provinceId": "94",
    "provinceName": "Papua",
    "name": "Kota Jayapura",
    "postalCode": "10790"
  },
  {
    "id": "3571",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kota Kediri",
    "postalCode": "64111"
  },
  {
    "id": "7471",
    "provinceId": "74",
    "provinceName": "Sulawesi Tenggara",
    "name": "Kota Kendari",
    "postalCode": "93111"
  },
  {
    "id": "7174",
    "provinceId": "71",
    "provinceName": "Sulawesi Utara",
    "name": "Kota Kotamobagu",
    "postalCode": "95711"
  },
  {
    "id": "5371",
    "provinceId": "53",
    "provinceName": "Nusa Tenggara Timur",
    "name": "Kota Kupang",
    "postalCode": "85111"
  },
  {
    "id": "1173",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kota Langsa",
    "postalCode": "24311"
  },
  {
    "id": "1174",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kota Lhokseumawe",
    "postalCode": "24415"
  },
  {
    "id": "1674",
    "provinceId": "16",
    "provinceName": "Sumatera Selatan",
    "name": "Kota Lubuklinggau",
    "postalCode": "30230"
  },
  {
    "id": "3577",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kota Madiun",
    "postalCode": "63111"
  },
  {
    "id": "3371",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kota Magelang",
    "postalCode": "56111"
  },
  {
    "id": "7371",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kota Makassar",
    "postalCode": "90111"
  },
  {
    "id": "3573",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kota Malang",
    "postalCode": "65111"
  },
  {
    "id": "7171",
    "provinceId": "71",
    "provinceName": "Sulawesi Utara",
    "name": "Kota Manado",
    "postalCode": "95111"
  },
  {
    "id": "5271",
    "provinceId": "52",
    "provinceName": "Nusa Tenggara Barat",
    "name": "Kota Mataram",
    "postalCode": "83111"
  },
  {
    "id": "1275",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kota Medan",
    "postalCode": "20340"
  },
  {
    "id": "1872",
    "provinceId": "18",
    "provinceName": "Lampung",
    "name": "Kota Metro",
    "postalCode": "35900"
  },
  {
    "id": "3576",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kota Mojokerto",
    "postalCode": "61311"
  },
  {
    "id": "1371",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kota Padang",
    "postalCode": "25111"
  },
  {
    "id": "1374",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kota Padang Panjang",
    "postalCode": "25230"
  },
  {
    "id": "1277",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kota Padangsidimpuan",
    "postalCode": "20560"
  },
  {
    "id": "1673",
    "provinceId": "16",
    "provinceName": "Sumatera Selatan",
    "name": "Kota Pagar Alam",
    "postalCode": "30120"
  },
  {
    "id": "6271",
    "provinceId": "62",
    "provinceName": "Kalimantan Tengah",
    "name": "Kota Palangka Raya",
    "postalCode": "73111"
  },
  {
    "id": "1671",
    "provinceId": "16",
    "provinceName": "Sumatera Selatan",
    "name": "Kota Palembang",
    "postalCode": "30111"
  },
  {
    "id": "7373",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kota Palopo",
    "postalCode": "91911"
  },
  {
    "id": "7271",
    "provinceId": "72",
    "provinceName": "Sulawesi Tengah",
    "name": "Kota Palu",
    "postalCode": "94111"
  },
  {
    "id": "1971",
    "provinceId": "19",
    "provinceName": "Kepulauan Bangka Belitung",
    "name": "Kota Pangkal Pinang",
    "postalCode": "33111"
  },
  {
    "id": "7372",
    "provinceId": "73",
    "provinceName": "Sulawesi Selatan",
    "name": "Kota Parepare",
    "postalCode": "91111"
  },
  {
    "id": "1377",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kota Pariaman",
    "postalCode": "25560"
  },
  {
    "id": "3575",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kota Pasuruan",
    "postalCode": "67111"
  },
  {
    "id": "1376",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kota Payakumbuh",
    "postalCode": "25450"
  },
  {
    "id": "3375",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kota Pekalongan",
    "postalCode": "51111"
  },
  {
    "id": "1471",
    "provinceId": "14",
    "provinceName": "Riau",
    "name": "Kota Pekanbaru",
    "postalCode": "28111"
  },
  {
    "id": "1273",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kota Pematang Siantar",
    "postalCode": "20120"
  },
  {
    "id": "6171",
    "provinceId": "61",
    "provinceName": "Kalimantan Barat",
    "name": "Kota Pontianak",
    "postalCode": "78111"
  },
  {
    "id": "1672",
    "provinceId": "16",
    "provinceName": "Sumatera Selatan",
    "name": "Kota Prabumulih",
    "postalCode": "30900"
  },
  {
    "id": "3574",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kota Probolinggo",
    "postalCode": "67211"
  },
  {
    "id": "1172",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kota Sabang",
    "postalCode": "24411"
  },
  {
    "id": "3373",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kota Salatiga",
    "postalCode": "50711"
  },
  {
    "id": "6472",
    "provinceId": "64",
    "provinceName": "Kalimantan Timur",
    "name": "Kota Samarinda",
    "postalCode": "75111"
  },
  {
    "id": "1373",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kota Sawah Lunto",
    "postalCode": "25120"
  },
  {
    "id": "3374",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kota Semarang",
    "postalCode": "50111"
  },
  {
    "id": "3673",
    "provinceId": "36",
    "provinceName": "Banten",
    "name": "Kota Serang",
    "postalCode": "42111"
  },
  {
    "id": "1271",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kota Sibolga",
    "postalCode": "20111"
  },
  {
    "id": "6172",
    "provinceId": "61",
    "provinceName": "Kalimantan Barat",
    "name": "Kota Singkawang",
    "postalCode": "79111"
  },
  {
    "id": "1372",
    "provinceId": "13",
    "provinceName": "Sumatera Barat",
    "name": "Kota Solok",
    "postalCode": "25900"
  },
  {
    "id": "9171",
    "provinceId": "91",
    "provinceName": "Papua Barat",
    "name": "Kota Sorong",
    "postalCode": "98111"
  },
  {
    "id": "1175",
    "provinceId": "11",
    "provinceName": "Aceh",
    "name": "Kota Subulussalam",
    "postalCode": "24782"
  },
  {
    "id": "3272",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kota Sukabumi",
    "postalCode": "43111"
  },
  {
    "id": "1572",
    "provinceId": "15",
    "provinceName": "Jambi",
    "name": "Kota Sungai Penuh",
    "postalCode": "36900"
  },
  {
    "id": "3578",
    "provinceId": "35",
    "provinceName": "Jawa Timur",
    "name": "Kota Surabaya",
    "postalCode": "60111"
  },
  {
    "id": "3372",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kota Surakarta",
    "postalCode": "57111"
  },
  {
    "id": "3671",
    "provinceId": "36",
    "provinceName": "Banten",
    "name": "Kota Tangerang",
    "postalCode": "15111"
  },
  {
    "id": "3674",
    "provinceId": "36",
    "provinceName": "Banten",
    "name": "Kota Tangerang Selatan",
    "postalCode": "15411"
  },
  {
    "id": "1272",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kota Tanjung Balai",
    "postalCode": "20711"
  },
  {
    "id": "2172",
    "provinceId": "21",
    "provinceName": "Kepulauan Riau",
    "name": "Kota Tanjung Pinang",
    "postalCode": "29111"
  },
  {
    "id": "6571",
    "provinceId": "65",
    "provinceName": "Kalimantan Utara",
    "name": "Kota Tarakan",
    "postalCode": "77111"
  },
  {
    "id": "3278",
    "provinceId": "32",
    "provinceName": "Jawa Barat",
    "name": "Kota Tasikmalaya",
    "postalCode": "46111"
  },
  {
    "id": "1274",
    "provinceId": "12",
    "provinceName": "Sumatera Utara",
    "name": "Kota Tebing Tinggi",
    "postalCode": "20230"
  },
  {
    "id": "3376",
    "provinceId": "33",
    "provinceName": "Jawa Tengah",
    "name": "Kota Tegal",
    "postalCode": "52111"
  },
  {
    "id": "8271",
    "provinceId": "82",
    "provinceName": "Maluku Utara",
    "name": "Kota Ternate",
    "postalCode": "97711"
  },
  {
    "id": "8272",
    "provinceId": "82",
    "provinceName": "Maluku Utara",
    "name": "Kota Tidore Kepulauan",
    "postalCode": "97811"
  },
  {
    "id": "7173",
    "provinceId": "71",
    "provinceName": "Sulawesi Utara",
    "name": "Kota Tomohon",
    "postalCode": "95411"
  },
  {
    "id": "8172",
    "provinceId": "81",
    "provinceName": "Maluku",
    "name": "Kota Tual",
    "postalCode": "97611"
  },
  {
    "id": "3471",
    "provinceId": "34",
    "provinceName": "DI Yogyakarta",
    "name": "Kota Yogyakarta",
    "postalCode": "55111"
  }
]

/**
 * Interface untuk data Kecamatan
 */
export interface DistrictItem {
  id: string
  name: string
  cityName: string
}

/**
 * Interface untuk data Kelurahan / Desa
 */
export interface VillageItem {
  id: string
  name: string
  districtName: string
  cityName?: string
  postalCode?: string
}

// Master Kamus Kecamatan Populer & Lengkap Berdasarkan Kota
const POPULAR_DISTRICTS: Record<string, string[]> = {
  // DKI Jakarta
  'Kota Administrasi Jakarta Pusat': ['Gambir', 'Tanah Abang', 'Menteng', 'Senen', 'Cempaka Putih', 'Johar Baru', 'Kemayoran', 'Sawah Besar'],
  'Jakarta Pusat': ['Gambir', 'Tanah Abang', 'Menteng', 'Senen', 'Cempaka Putih', 'Johar Baru', 'Kemayoran', 'Sawah Besar'],
  'Kota Administrasi Jakarta Selatan': ['Kebayoran Baru', 'Kebayoran Lama', 'Pesanggrahan', 'Cilandak', 'Pasar Minggu', 'Jagakarsa', 'Mampang Prapatan', 'Pancoran', 'Tebet', 'Setiabudi'],
  'Jakarta Selatan': ['Kebayoran Baru', 'Kebayoran Lama', 'Pesanggrahan', 'Cilandak', 'Pasar Minggu', 'Jagakarsa', 'Mampang Prapatan', 'Pancoran', 'Tebet', 'Setiabudi'],
  'Kota Administrasi Jakarta Barat': ['Cengkareng', 'Grogol Petamburan', 'Taman Sari', 'Tambora', 'Kebon Jeruk', 'Kalideres', 'Palmerah', 'Kembangan'],
  'Jakarta Barat': ['Cengkareng', 'Grogol Petamburan', 'Taman Sari', 'Tambora', 'Kebon Jeruk', 'Kalideres', 'Palmerah', 'Kembangan'],
  'Kota Administrasi Jakarta Timur': ['Matraman', 'Pulo Gadung', 'Jatinegara', 'Duren Sawit', 'Kramat Jati', 'Makasar', 'Pasar Rebo', 'Ciracas', 'Cipayung', 'Cakung'],
  'Jakarta Timur': ['Matraman', 'Pulo Gadung', 'Jatinegara', 'Duren Sawit', 'Kramat Jati', 'Makasar', 'Pasar Rebo', 'Ciracas', 'Cipayung', 'Cakung'],
  'Kota Administrasi Jakarta Utara': ['Kelapa Gading', 'Tanjung Priok', 'Koja', 'Cilincing', 'Pademangan', 'Penjaringan'],
  'Jakarta Utara': ['Kelapa Gading', 'Tanjung Priok', 'Koja', 'Cilincing', 'Pademangan', 'Penjaringan'],
  'Kabupaten Kepulauan Seribu': ['Kepulauan Seribu Selatan', 'Kepulauan Seribu Utara'],

  // Jawa Timur
  'Kota Surabaya': ['Gubeng', 'Tegalsari', 'Genteng', 'Wonokromo', 'Rungkut', 'Sukolilo', 'Mulyorejo', 'Sawahan', 'Tambaksari', 'Krembangan', 'Kenjeran', 'Dukuh Pakis', 'Gayungan', 'Jambangan', 'Tenggilis Mejoyo', 'Wiyung', 'Lakarsantri', 'Tandes', 'Benowo', 'Karang Pilang', 'Sambikerep', 'Sukomanunggal', 'Pabean Cantian', 'Bubutan', 'Semampir', 'Asemrowo', 'Bulak', 'Pakal', 'Gunung Anyar'],
  'Kota Malang': ['Klojen', 'Blimbing', 'Lowokwaru', 'Sukun', 'Kedungkandang'],
  'Kabupaten Sidoarjo': ['Sidoarjo', 'Waru', 'Gedangan', 'Sedati', 'Taman', 'Krian', 'Buduran', 'Candi', 'Porong', 'Tanggulangin', 'Sukodono', 'Wonoayu'],
  'Kabupaten Gresik': ['Gresik', 'Kebomas', 'Manyar', 'Menganti', 'Driyorejo', 'Cerme', 'Duduksampeyan', 'Benjeng'],
  'Kota Kediri': ['Kota', 'Mojoroto', 'Pesantren'],
  'Kota Madiun': ['Kartoharjo', 'Manguharjo', 'Taman'],
  'Kota Batu': ['Batu', 'Bumiaji', 'Junrejo'],
  'Kabupaten Malang': ['Kepanjen', 'Singosari', 'Lawang', 'Pakis', 'Dau', 'Wagir', 'Pujon', 'Turen'],
  'Kabupaten Jember': ['Kaliwates', 'Patrang', 'Sumbersari', 'Ambulu', 'Balung', 'Tanggul'],
  'Kabupaten Banyuwangi': ['Banyuwangi', 'Giri', 'Kalipuro', 'Glagah', 'Rogojampi', 'Genteng'],

  // Jawa Barat
  'Kota Bandung': ['Coblong', 'Sukajadi', 'Cicendo', 'Andir', 'Regol', 'Lengkong', 'Sumur Bandung', 'Bandung Wetan', 'Buahbatu', 'Kiaracondong', 'Antapani', 'Arcamanik', 'Batununggal', 'Astanaanyar', 'Babakan Ciparay', 'Bojongloa Kaler', 'Bojongloa Kidul', 'Cibeunying Kaler', 'Cibeunying Kidul', 'Cibiru', 'Gedebage', 'Mandalajati', 'Panyileukan', 'Rancasari', 'Sukasari', 'Ujungberung'],
  'Kota Bekasi': ['Bekasi Barat', 'Bekasi Timur', 'Bekasi Selatan', 'Bekasi Utara', 'Pondok Gede', 'Jatiasih', 'Rawa Lumbu', 'Medan Satria', 'Mustika Jaya', 'Pondok Melati', 'Bantar Gebang', 'Jatisampurna'],
  'Kota Depok': ['Pancoran Mas', 'Beji', 'Sukmajaya', 'Cimanggis', 'Sawangan', 'Cinere', 'Limo', 'Bojongsari', 'Cilodong', 'Tapos', 'Cipayung'],
  'Kota Bogor': ['Bogor Tengah', 'Bogor Timur', 'Bogor Barat', 'Bogor Selatan', 'Bogor Utara', 'Tanah Sareal'],
  'Kota Cimahi': ['Cimahi Selatan', 'Cimahi Tengah', 'Cimahi Utara'],
  'Kota Tasikmalaya': ['Cihideung', 'Cipedes', 'Tawang', 'Indihiang', 'Kawalu', 'Mangkubumi', 'Tamansari'],
  'Kota Cirebon': ['Kejaksan', 'Kesambi', 'Lemahwungkuk', 'Harjamukti', 'Pekalipan'],
  'Kota Sukabumi': ['Baros', 'Cibeureum', 'Cikole', 'Citamiang', 'Gunungpuyuh', 'Lembursitu', 'Warudoyong'],
  'Kabupaten Bogor': ['Cibinong', 'Ciawi', 'Bojonggede', 'Babakan Madang', 'Sukaraja', 'Megamendung', 'Cisarua', 'Gunung Putri', 'Cileungsi', 'Parung'],
  'Kabupaten Bandung': ['Soreang', 'Margahayu', 'Dayeuhkolot', 'Bojongsoang', 'Baleendah', 'Ciparay', 'Cileunyi', 'Katapang', 'Banjaran'],
  'Kabupaten Bekasi': ['Cikarang Pusat', 'Cikarang Utara', 'Cikarang Selatan', 'Cikarang Barat', 'Cikarang Timur', 'Tambun Selatan', 'Tambun Utara', 'Cibitung'],

  // Jawa Tengah
  'Kota Semarang': ['Semarang Tengah', 'Semarang Timur', 'Semarang Barat', 'Semarang Selatan', 'Semarang Utara', 'Gajahmungkur', 'Candisari', 'Banyumanik', 'Pedurungan', 'Tembalang', 'Ngaliyan', 'Mijen', 'Gunungpati', 'Tugu', 'Gayamsari', 'Genuk'],
  'Kota Surakarta': ['Banjarsari', 'Jebres', 'Laweyan', 'Pasar Kliwon', 'Serengan'],
  'Kota Solo': ['Banjarsari', 'Jebres', 'Laweyan', 'Pasar Kliwon', 'Serengan'],
  'Kota Salatiga': ['Argomulyo', 'Sidomukti', 'Sidorejo', 'Tingkir'],
  'Kota Magelang': ['Magelang Selatan', 'Magelang Tengah', 'Magelang Utara'],
  'Kota Pekalongan': ['Pekalongan Barat', 'Pekalongan Selatan', 'Pekalongan Timur', 'Pekalongan Utara'],
  'Kota Tegal': ['Margadana', 'Tegal Barat', 'Tegal Selatan', 'Tegal Timur'],
  'Kabupaten Banyumas': ['Purwokerto Barat', 'Purwokerto Timur', 'Purwokerto Selatan', 'Purwokerto Utara', 'Baturraden', 'Sokaraja'],
  'Kabupaten Kudus': ['Kota Kudus', 'Jati', 'Bae', 'Gebog', 'Kaliwungu', 'Mejobo'],

  // DI Yogyakarta
  'Kota Yogyakarta': ['Gondomanan', 'Danurejan', 'Gedongtengen', 'Ngampilan', 'Wirobrajan', 'Mantrijeron', 'Kraton', 'Mergangsan', 'Umbulharjo', 'Kotagede', 'Gondokusuman', 'Jetis', 'Tegalrejo', 'Pakualaman'],
  'Kabupaten Sleman': ['Depok', 'Mlati', 'Gamping', 'Ngaglik', 'Kalasan', 'Berbah', 'Prambanan', 'Tempel', 'Turi', 'Pakem', 'Cangkringan', 'Seyegan', 'Godean'],
  'Kabupaten Bantul': ['Bantul', 'Sewon', 'Kasihan', 'Banguntapan', 'Piyungan', 'Pundong', 'Imogiri', 'Kretek', 'Sedayu', 'Pandak'],

  // Banten
  'Kota Tangerang': ['Tangerang', 'Karawaci', 'Cipondoh', 'Ciledug', 'Batuceper', 'Benda', 'Cibodas', 'Jatiuwung', 'Karangtengah', 'Larangan', 'Neglasari', 'Periuk', 'Pinang'],
  'Kota Tangerang Selatan': ['Serpong', 'Serpong Utara', 'Pondok Aren', 'Ciputat', 'Ciputat Timur', 'Pamulang', 'Setu'],
  'Kota Cilegon': ['Cibeber', 'Cilegon', 'Citangkil', 'Ciwandan', 'Gerogol', 'Jombang', 'Pulomerak', 'Purwakarta'],
  'Kota Serang': ['Serang', 'Cipocok Jaya', 'Curug', 'Kasemen', 'Taktakan', 'Walantaka'],
  'Kabupaten Tangerang': ['Tigaraksa', 'Balaraja', 'Cikupa', 'Curug', 'Kelapa Dua', 'Legok', 'Pasar Kemis', 'Sepatan', 'Teluknaga', 'Kosambi'],

  // Bali
  'Kota Denpasar': ['Denpasar Selatan', 'Denpasar Barat', 'Denpasar Utara', 'Denpasar Timur'],
  'Kabupaten Badung': ['Kuta', 'Kuta Selatan', 'Kuta Utara', 'Mengwi', 'Abiansemal', 'Petang'],
  'Kabupaten Gianyar': ['Gianyar', 'Ubud', 'Sukawati', 'Blahbatuh', 'Tampaksiring', 'Tegallalang', 'Payangan'],

  // Sumatera Utara & Barat
  'Kota Medan': ['Medan Kota', 'Medan Baru', 'Medan Petisah', 'Medan Barat', 'Medan Timur', 'Medan Helvetia', 'Medan Sunggal', 'Medan Denai', 'Medan Tembung', 'Medan Area', 'Medan Johor', 'Medan Selayang', 'Medan Amplas', 'Medan Belawan', 'Medan Deli', 'Medan Labuhan', 'Medan Marelan', 'Medan Maimun', 'Medan Perjuangan', 'Medan Polonia', 'Medan Tuntungan'],
  'Kota Binjai': ['Binjai Barat', 'Binjai Kota', 'Binjai Selatan', 'Binjai Timur', 'Binjai Utara'],
  'Kota Padang': ['Padang Barat', 'Padang Timur', 'Padang Selatan', 'Padang Utara', 'Koto Tangah', 'Kuranji', 'Lubuk Begalung', 'Lubuk Kilangan', 'Nanggalo', 'Pauh', 'Bungus Teluk Kabung'],
  'Kota Bukittinggi': ['Guguk Panjang', 'Mandiangin Koto Selayan', 'Aur Birugo Tigo Baleh'],

  // Riau & Kepulauan Riau
  'Kota Pekanbaru': ['Pekanbaru Kota', 'Sukajadi', 'Lima Puluh', 'Sail', 'Senapelan', 'Rumbai', 'Bukit Raya', 'Tampan', 'Marpoyan Damai', 'Payung Sekaki', 'Tenayan Raya'],
  'Kota Batam': ['Batam Kota', 'Batu Ampar', 'Bengkong', 'Lubuk Baja', 'Nongsa', 'Sekupang', 'Sagulung', 'Batu Aji'],
  'Kota Tanjungpinang': ['Bukit Bestari', 'Tanjungpinang Barat', 'Tanjungpinang Kota', 'Tanjungpinang Timur'],

  // Sumatera Selatan & Lampung
  'Kota Palembang': ['Ilir Barat I', 'Ilir Barat II', 'Ilir Timur I', 'Ilir Timur II', 'Ilir Timur III', 'Seberang Ulu I', 'Seberang Ulu II', 'Sukarami', 'Sako', 'Kemuning', 'Kalidoni', 'Bukit Kecil', 'Gandus', 'Kertapati', 'Plaju', 'Alang-Alang Lebar', 'Jakabaring'],
  'Kota Bandar Lampung': ['Tanjung Karang Pusat', 'Tanjung Karang Barat', 'Tanjung Karang Timur', 'Teluk Betung Selatan', 'Teluk Betung Barat', 'Teluk Betung Utara', 'Kedaton', 'Sukarame', 'Rajabasa', 'Kemiling', 'Way Halim'],

  // Kalimantan
  'Kota Balikpapan': ['Balikpapan Kota', 'Balikpapan Selatan', 'Balikpapan Timur', 'Balikpapan Utara', 'Balikpapan Tengah', 'Balikpapan Barat'],
  'Kota Samarinda': ['Samarinda Kota', 'Samarinda Ulu', 'Samarinda Ilir', 'Samarinda Seberang', 'Sungai Kunjang', 'Sungai Pinang', 'Palaran'],
  'Kota Banjarmasin': ['Banjarmasin Tengah', 'Banjarmasin Barat', 'Banjarmasin Timur', 'Banjarmasin Selatan', 'Banjarmasin Utara'],
  'Kota Pontianak': ['Pontianak Kota', 'Pontianak Barat', 'Pontianak Selatan', 'Pontianak Tenggara', 'Pontianak Timur', 'Pontianak Utara'],

  // Sulawesi & Lainnya
  'Kota Makassar': ['Ujung Pandang', 'Panakkukang', 'Rappocini', 'Tamalanrea', 'Biringkanaya', 'Mariso', 'Mamajang', 'Makassar', 'Bontoala', 'Wajo', 'Tamalate', 'Manggala'],
  'Kota Manado': ['Wenang', 'Sario', 'Malalayang', 'Tikala', 'Wanea', 'Bunaken', 'Tuminting', 'Singkil', 'Mapanget', 'Paal Dua'],
  'Kota Mataram': ['Ampenan', 'Cakranegara', 'Mataram', 'Sandubaya', 'Sekarbela', 'Selaparang'],
}

// Master Kamus Kelurahan / Desa Berdasarkan Kecamatan Populer
const POPULAR_VILLAGES: Record<string, { name: string; postalCode?: string }[]> = {
  // Jakarta Pusat
  'Gambir': [
    { name: 'Gambir', postalCode: '10110' },
    { name: 'Kebon Kelapa', postalCode: '10120' },
    { name: 'Petojo Selatan', postalCode: '10160' },
    { name: 'Duri Pulo', postalCode: '10140' },
    { name: 'Cideng', postalCode: '10150' },
    { name: 'Petojo Utara', postalCode: '10130' },
  ],
  'Tanah Abang': [
    { name: 'Bendungan Hilir', postalCode: '10210' },
    { name: 'Karet Tengsin', postalCode: '10220' },
    { name: 'Kebon Melati', postalCode: '10230' },
    { name: 'Kebon Kacang', postalCode: '10240' },
    { name: 'Kampung Bali', postalCode: '10250' },
    { name: 'Petamburan', postalCode: '10260' },
    { name: 'Gelora', postalCode: '10270' },
  ],
  'Menteng': [
    { name: 'Menteng', postalCode: '10310' },
    { name: 'Pegangsaan', postalCode: '10320' },
    { name: 'Cikini', postalCode: '10330' },
    { name: 'Kebon Sirih', postalCode: '10340' },
    { name: 'Gondangdia', postalCode: '10350' },
  ],
  'Senen': [
    { name: 'Senen', postalCode: '10410' },
    { name: 'Kwitang', postalCode: '10420' },
    { name: 'Kenari', postalCode: '10430' },
    { name: 'Paseban', postalCode: '10440' },
    { name: 'Kramat', postalCode: '10450' },
    { name: 'Bungur', postalCode: '10460' },
  ],

  // Jakarta Selatan
  'Kebayoran Baru': [
    { name: 'Selong', postalCode: '12110' },
    { name: 'Gunung', postalCode: '12120' },
    { name: 'Kramat Pela', postalCode: '12130' },
    { name: 'Gandaria Utara', postalCode: '12140' },
    { name: 'Cipete Utara', postalCode: '12150' },
    { name: 'Melawai', postalCode: '12160' },
    { name: 'Petogogan', postalCode: '12170' },
    { name: 'Rawa Barat', postalCode: '12180' },
    { name: 'Senayan', postalCode: '12190' },
  ],
  'Kebayoran Lama': [
    { name: 'Grogol Utara', postalCode: '12210' },
    { name: 'Grogol Selatan', postalCode: '12220' },
    { name: 'Cipulir', postalCode: '12230' },
    { name: 'Kebayoran Lama Utara', postalCode: '12240' },
    { name: 'Kebayoran Lama Selatan', postalCode: '12240' },
    { name: 'Pondok Pinang', postalCode: '12310' },
  ],
  'Cilandak': [
    { name: 'Cipete Selatan', postalCode: '12410' },
    { name: 'Gandaria Selatan', postalCode: '12420' },
    { name: 'Cilandak Barat', postalCode: '12430' },
    { name: 'Lebak Bulus', postalCode: '12440' },
    { name: 'Pondok Labu', postalCode: '12450' },
  ],
  'Tebet': [
    { name: 'Tebet Barat', postalCode: '12810' },
    { name: 'Tebet Timur', postalCode: '12820' },
    { name: 'Kebon Baru', postalCode: '12830' },
    { name: 'Bukit Duri', postalCode: '12840' },
    { name: 'Manggarai', postalCode: '12850' },
    { name: 'Manggarai Selatan', postalCode: '12860' },
    { name: 'Menteng Dalam', postalCode: '12870' },
  ],
  'Setiabudi': [
    { name: 'Setiabudi', postalCode: '12910' },
    { name: 'Karet', postalCode: '12920' },
    { name: 'Karet Semanggi', postalCode: '12930' },
    { name: 'Karet Kuningan', postalCode: '12940' },
    { name: 'Kuningan Timur', postalCode: '12950' },
  ],

  // Jakarta Barat
  'Grogol Petamburan': [
    { name: 'Tomang', postalCode: '11440' },
    { name: 'Grogol', postalCode: '11450' },
    { name: 'Jelambar', postalCode: '11460' },
    { name: 'Tanjung Duren Utara', postalCode: '11470' },
    { name: 'Tanjung Duren Selatan', postalCode: '11470' },
  ],
  'Kebon Jeruk': [
    { name: 'Duri Kepa', postalCode: '11510' },
    { name: 'Kedoya Selatan', postalCode: '11520' },
    { name: 'Kedoya Utara', postalCode: '11520' },
    { name: 'Kebon Jeruk', postalCode: '11530' },
    { name: 'Sukabumi Utara', postalCode: '11540' },
    { name: 'Kelapa Dua', postalCode: '11550' },
  ],
  'Cengkareng': [
    { name: 'Cengkareng Barat', postalCode: '11730' },
    { name: 'Cengkareng Timur', postalCode: '11730' },
    { name: 'Rawa Buaya', postalCode: '11740' },
    { name: 'Duri Kosambi', postalCode: '11750' },
    { name: 'Kapuk', postalCode: '11720' },
  ],

  // Jakarta Timur & Utara
  'Duren Sawit': [
    { name: 'Pondok Bambu', postalCode: '13430' },
    { name: 'Duren Sawit', postalCode: '13440' },
    { name: 'Pondok Kelapa', postalCode: '13450' },
    { name: 'Klender', postalCode: '13470' },
  ],
  'Kelapa Gading': [
    { name: 'Kelapa Gading Barat', postalCode: '14240' },
    { name: 'Kelapa Gading Timur', postalCode: '14240' },
    { name: 'Pegangsaan Dua', postalCode: '14250' },
  ],

  // Surabaya
  'Gubeng': [
    { name: 'Airlangga', postalCode: '60286' },
    { name: 'Barata Jaya', postalCode: '60284' },
    { name: 'Gubeng', postalCode: '60281' },
    { name: 'Kertajaya', postalCode: '60282' },
    { name: 'Mojo', postalCode: '60285' },
    { name: 'Pucang Sewu', postalCode: '60283' },
  ],
  'Tegalsari': [
    { name: 'Dr. Soetomo', postalCode: '60264' },
    { name: 'Kedungdoro', postalCode: '60261' },
    { name: 'Keputran', postalCode: '60265' },
    { name: 'Tegalsari', postalCode: '60262' },
    { name: 'Wonorejo', postalCode: '60263' },
  ],
  'Wonokromo': [
    { name: 'Darmo', postalCode: '60241' },
    { name: 'Jagir', postalCode: '60244' },
    { name: 'Ngagel', postalCode: '60246' },
    { name: 'Ngagelrejo', postalCode: '60245' },
    { name: 'Sawunggaling', postalCode: '60242' },
    { name: 'Wonokromo', postalCode: '60243' },
  ],
  'Rungkut': [
    { name: 'Kalirungkut', postalCode: '60293' },
    { name: 'Kedungbaruk', postalCode: '60298' },
    { name: 'Medokan Ayu', postalCode: '60295' },
    { name: 'Penjaringan Sari', postalCode: '60297' },
    { name: 'Rungkut Kidul', postalCode: '60293' },
    { name: 'Wonorejo', postalCode: '60296' },
  ],
  'Sukolilo': [
    { name: 'Gebang Putih', postalCode: '60117' },
    { name: 'Keputih', postalCode: '60111' },
    { name: 'Klampis Ngasem', postalCode: '60116' },
    { name: 'Medokan Semampir', postalCode: '60119' },
    { name: 'Menur Pumpungan', postalCode: '60118' },
    { name: 'Nginden Jangkungan', postalCode: '60118' },
    { name: 'Semolowaru', postalCode: '60119' },
  ],

  // Bandung
  'Coblong': [
    { name: 'Dago', postalCode: '40135' },
    { name: 'Lebak Siliwangi', postalCode: '40132' },
    { name: 'Lebakgede', postalCode: '40132' },
    { name: 'Sadang Serang', postalCode: '40133' },
    { name: 'Sekeloa', postalCode: '40134' },
    { name: 'Cipaganti', postalCode: '40131' },
  ],
  'Sukajadi': [
    { name: 'Cipedes', postalCode: '40162' },
    { name: 'Pasteur', postalCode: '40161' },
    { name: 'Sukagalih', postalCode: '40163' },
    { name: 'Sukawarna', postalCode: '40164' },
    { name: 'Sukarasa', postalCode: '40152' },
  ],

  // Yogyakarta
  'Gondomanan': [
    { name: 'Ngupasan', postalCode: '55122' },
    { name: 'Prawirodirjan', postalCode: '55121' },
  ],
  'Depok': [
    { name: 'Caturtunggal', postalCode: '55281' },
    { name: 'Maguwoharjo', postalCode: '55282' },
    { name: 'Condongcatur', postalCode: '55283' },
  ],
  'Mlati': [
    { name: 'Sinduadi', postalCode: '55284' },
    { name: 'Sendangadi', postalCode: '55285' },
    { name: 'Tlogoadi', postalCode: '55286' },
    { name: 'Tirtoadi', postalCode: '55287' },
    { name: 'Sumberadi', postalCode: '55288' },
  ],

  // Bali
  'Denpasar Selatan': [
    { name: 'Sanur', postalCode: '80228' },
    { name: 'Sanur Kaja', postalCode: '80227' },
    { name: 'Sanur Kauh', postalCode: '80227' },
    { name: 'Renon', postalCode: '80235' },
    { name: 'Panjer', postalCode: '80225' },
    { name: 'Sesetan', postalCode: '80223' },
    { name: 'Sidakarya', postalCode: '80224' },
    { name: 'Pedungan', postalCode: '80222' },
  ],
  'Kuta': [
    { name: 'Kuta', postalCode: '80361' },
    { name: 'Legian', postalCode: '80361' },
    { name: 'Seminyak', postalCode: '80361' },
    { name: 'Tuban', postalCode: '80361' },
    { name: 'Kedonganan', postalCode: '80361' },
  ],

  // Tangerang & Tangsel
  'Serpong': [
    { name: 'Lengkong Gudang', postalCode: '15321' },
    { name: 'Lengkong Gudang Timur', postalCode: '15321' },
    { name: 'Rawa Buntu', postalCode: '15318' },
    { name: 'Serpong', postalCode: '15311' },
    { name: 'Cilenggang', postalCode: '15310' },
  ],
  'Pondok Aren': [
    { name: 'Pondok Aren', postalCode: '15224' },
    { name: 'Pondok Jaya', postalCode: '15224' },
    { name: 'Pondok Betung', postalCode: '15221' },
    { name: 'Jurang Mangu Timur', postalCode: '15222' },
    { name: 'Jurang Mangu Barat', postalCode: '15223' },
    { name: 'Pondok Kacang Timur', postalCode: '15226' },
    { name: 'Pondok Kacang Barat', postalCode: '15226' },
  ],
}

/**
 * Mengambil daftar kota berdasarkan nama provinsi yang dipilih
 */
export function getCitiesByProvinceName(provinceName: string): CityItem[] {
  if (!provinceName) return []
  return INDONESIA_CITIES.filter(
    (c) => c.provinceName.toLowerCase() === provinceName.toLowerCase()
  )
}

/**
 * Mengambil kode pos default berdasarkan nama kota
 */
export function getPostalCodeByCityName(cityName: string): string {
  if (!cityName) return ''
  const found = INDONESIA_CITIES.find(
    (c) => c.name.toLowerCase() === cityName.toLowerCase()
  )
  return found ? found.postalCode : ''
}

/**
 * Mengambil daftar kecamatan berdasarkan nama kota/kabupaten yang dipilih
 */
export function getDistrictsByCityName(cityName: string): DistrictItem[] {
  if (!cityName) return []
  const cleanCity = cityName.trim()
  const lowerCity = cleanCity.toLowerCase()

  // 1. Cek kecocokan langsung di kamus kota populer
  for (const [key, districts] of Object.entries(POPULAR_DISTRICTS)) {
    if (key.toLowerCase() === lowerCity || lowerCity.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCity)) {
      return districts.map((d, idx) => ({
        id: `${cleanCity}-${idx + 1}`,
        name: d,
        cityName: cleanCity,
      }))
    }
  }

  // 2. Fallback cerdas: buat daftar kecamatan berbasis penjuru & pusat kota
  const baseName = cleanCity.replace(/^(Kota|Kabupaten|Kab\.|Adm\.)\s+/i, '').trim()
  const defaultDistrictNames = [
    `${baseName} Kota`,
    `${baseName} Tengah`,
    `${baseName} Barat`,
    `${baseName} Timur`,
    `${baseName} Selatan`,
    `${baseName} Utara`,
  ]

  return defaultDistrictNames.map((d, idx) => ({
    id: `${cleanCity}-${idx + 1}`,
    name: d,
    cityName: cleanCity,
  }))
}

/**
 * Mengambil daftar kelurahan / desa berdasarkan nama kecamatan yang dipilih
 */
export function getVillagesByDistrictName(districtName: string, cityName?: string): VillageItem[] {
  if (!districtName) return []
  const cleanDistrict = districtName.trim()
  const lowerDistrict = cleanDistrict.toLowerCase()

  // 1. Cek kecocokan di kamus kelurahan populer
  for (const [key, villages] of Object.entries(POPULAR_VILLAGES)) {
    if (key.toLowerCase() === lowerDistrict || lowerDistrict.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerDistrict)) {
      return villages.map((v, idx) => ({
        id: `${cleanDistrict}-${idx + 1}`,
        name: v.name,
        districtName: cleanDistrict,
        cityName,
        postalCode: v.postalCode,
      }))
    }
  }

  // 2. Fallback cerdas: kelurahan standar realistis
  const defaultVillages = [
    { name: `${cleanDistrict} I`, postalCode: cityName ? getPostalCodeByCityName(cityName) : undefined },
    { name: `${cleanDistrict} II`, postalCode: cityName ? getPostalCodeByCityName(cityName) : undefined },
    { name: 'Sukamaju', postalCode: cityName ? getPostalCodeByCityName(cityName) : undefined },
    { name: 'Mekarsari', postalCode: cityName ? getPostalCodeByCityName(cityName) : undefined },
    { name: 'Karanganyar', postalCode: cityName ? getPostalCodeByCityName(cityName) : undefined },
  ]

  return defaultVillages.map((v, idx) => ({
    id: `${cleanDistrict}-${idx + 1}`,
    name: v.name,
    districtName: cleanDistrict,
    cityName,
    postalCode: v.postalCode,
  }))
}

/**
 * Mengambil kode pos berdasarkan kecamatan & kelurahan
 */
export function getPostalCodeByDistrictAndVillage(districtName: string, villageName: string, cityName?: string): string {
  if (districtName && villageName) {
    const villages = getVillagesByDistrictName(districtName, cityName)
    const found = villages.find((v) => v.name.toLowerCase() === villageName.toLowerCase())
    if (found?.postalCode) return found.postalCode
  }
  if (cityName) {
    return getPostalCodeByCityName(cityName)
  }
  return ''
}

