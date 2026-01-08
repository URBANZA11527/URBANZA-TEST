
export interface AmazonSEO {
  title: string;
  description: string;
  bulletPoints: string[];
  averageSize: string;
}

export interface TrendyolSEO {
  title: string;
  description: string;
}

export interface PlatformResult {
  modelName: string;
  amazon?: {
    seo: AmazonSEO;
    prompts: ModelPrompts;
  };
  trendyol?: {
    seo: TrendyolSEO;
    prompts: ModelPrompts;
  };
}

export interface ModelPrompts {
  lifestyle1: string;
  lifestyle2: string;
  usage: string;
  features: string;
  sizing: string;
}

export enum ModelId {
  FLASH_3 = 'gemini-3-flash-preview',
  PRO_3 = 'gemini-3-pro-preview',
  FLASH_LITE = 'gemini-flash-lite-latest'
}
