export interface Messe {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  }

  export interface CoverInfo {
    coverId: string;
    title: string;
    coverA: string;
    coverB: string;
    countA: number;
    countB: number;
  }

  export interface GridItem {
    [key: string]: any;
  }

  export interface Option {
    text: string;
    correct: boolean;
    optionImageUrl?: string;
  }
  export interface Question {
    question: string;
    questionImageUrl?: string;
    options: Option[];
  }
  export interface QuizStats {
    [question: string]: {
      [answer: string]: number;
    };
  }

  export interface HomeSlot {
    title: string;
    type: string;
    dataId?: string;
    imageUrl?: string;
    slotPageId: string;
  }
  
  export interface SlotPage {
    id: string;
    name: string;
  }

  export interface AppSettings {
    backgroundImageUrl: string;
    ponsLogoUrl: string;
    langenscheidtLogoUrl: string;
    klettLogoUrl: string;
    footerLogoUrl: string;
    newsletterLanguageUrl: string;
    newsletterSchoolUrl: string;
    newsletterNoneUrl: string;
}

  export interface BrandAttribute {
    title: string;
  }
  export interface BrandData {
    brand: string;
    brandImageUrl?: string;
    attributes: BrandAttribute[];
  }

  export interface LinkData {
    provider: "langenscheidt" | "pons" | "klett";
    url: string;
    newTab: boolean;
  }
  
  export interface BrandMappingData {
    collectionTitle: string;
    links: LinkData[];
  }
  
  export interface BrandMappingDoc {
    id: string;
    data: BrandMappingData;
  }

  export interface SlotPage {
    id: string;
    name: string;
  }

  export interface SlotItem {
    displayName: string; // e.g. "Lehrerquiz"
    title: string; // internal label
    type:
    | ""
    | "quiz"
    | "buchcover"
    | "newsletter"
    | "marken"
    | "feedback"
    | "jugendwort"
    | "shop";
    dataId?: string; // single doc ID for the quiz
    imageUrl?: string;
    coverIds?: string[];
    slotPageId?: string | null;
  }

  export interface Messe {
    id: string;
    name: string;
    startDate: string; // or Date, if stored that way
    endDate: string;
  }

  export interface ApppSettingsField {
    key: keyof AppSettings;
    label: string;
  }