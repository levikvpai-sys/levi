import { productGuardian } from "./product-guardian";
import { brandDirector } from "./brand-director";
import { scriptStudio, type ScriptBrief } from "./script-studio";
import { promptDirector } from "./prompt-director";
import { socialAgent } from "./social-agent";
import { qaCritic } from "./qa-critic";
import type { Platform } from "@/types";

export interface CampaignBrief {
  title: string;
  product: string;
  productColor?: string;
  platforms: Platform[];
  style: string;
  objective: string;
  tone?: string;
  keyMessage?: string;
  targetAudience?: string;
  budget?: string;
  timeline?: string;
}

export interface CampaignResult {
  brief: CampaignBrief;
  validation: {
    product_guardian: Awaited<ReturnType<typeof productGuardian.validateConcept>>;
    brand_director: Awaited<ReturnType<typeof brandDirector.refineBrief>>;
  };
  scripts: Awaited<ReturnType<typeof scriptStudio.writeScript>>[];
  prompts: Awaited<ReturnType<typeof promptDirector.scriptToPrompts>>[];
  captions: Awaited<ReturnType<typeof socialAgent.buildPostPackage>>;
  qa_reports: Awaited<ReturnType<typeof qaCritic.reviewScript>>[];
  status: "success" | "partial" | "failed";
  errors: string[];
}

export class CampaignOrchestrator {
  async createCampaign(brief: CampaignBrief): Promise<CampaignResult> {
    const result: CampaignResult = {
      brief,
      validation: { product_guardian: null as never, brand_director: "" },
      scripts: [],
      prompts: [],
      captions: null as never,
      qa_reports: [],
      status: "success",
      errors: [],
    };

    // Step 1: Product Guardian validates concept
    try {
      const conceptText = `Product: ${brief.product}, Style: ${brief.style}, Objective: ${brief.objective}, Key Message: ${brief.keyMessage || ""}`;
      result.validation.product_guardian = await productGuardian.validateConcept(conceptText);

      if (!result.validation.product_guardian.passed) {
        const violations = result.validation.product_guardian.violations;
        if (violations.length > 0) {
          result.errors.push(`Product violations: ${violations.join("; ")}`);
        }
      }
    } catch (e) {
      result.errors.push(`Product Guardian error: ${String(e)}`);
    }

    // Step 2: Brand Director refines brief
    try {
      result.validation.brand_director = await brandDirector.refineBrief({
        concept: brief.objective,
        platform: brief.platforms[0],
        content_type: "campaign",
        target_emotion: brief.tone,
      });
    } catch (e) {
      result.errors.push(`Brand Director error: ${String(e)}`);
    }

    // Step 3: Script Studio writes scripts for each platform
    const scriptPromises = brief.platforms.map(async (platform) => {
      const scriptBrief: ScriptBrief = {
        product: brief.product,
        platform,
        style: brief.style,
        objective: result.validation.brand_director || brief.objective,
        tone: brief.tone,
        key_message: brief.keyMessage,
        target_audience: brief.targetAudience,
      };
      try {
        return await scriptStudio.writeScript(scriptBrief);
      } catch (e) {
        result.errors.push(`Script error for ${platform}: ${String(e)}`);
        return null;
      }
    });

    const scriptResults = await Promise.all(scriptPromises);
    result.scripts = scriptResults.filter(Boolean) as typeof result.scripts;

    // Step 4: QA Critic reviews each script
    const qaPromises = result.scripts.map(async (script) => {
      try {
        return await qaCritic.reviewScript(script);
      } catch (e) {
        result.errors.push(`QA error: ${String(e)}`);
        return null;
      }
    });
    const qaResults = await Promise.all(qaPromises);
    result.qa_reports = qaResults.filter(Boolean) as typeof result.qa_reports;

    // Step 5: Prompt Director builds shot list from approved scripts
    const approvedScripts = result.scripts.filter((_, i) => {
      const qa = result.qa_reports[i];
      return !qa || qa.overall_score >= 6;
    });

    const promptPromises = approvedScripts.map(async (script) => {
      try {
        return await promptDirector.scriptToPrompts(
          script,
          brief.product,
          brief.productColor || "vibrant"
        );
      } catch (e) {
        result.errors.push(`Prompt Director error: ${String(e)}`);
        return null;
      }
    });
    const promptResults = await Promise.all(promptPromises);
    result.prompts = promptResults.filter(Boolean) as typeof result.prompts;

    // Step 6: Social Agent builds post package
    try {
      result.captions = await socialAgent.buildPostPackage(
        brief.product,
        result.validation.brand_director || brief.objective,
        brief.platforms
      );
    } catch (e) {
      result.errors.push(`Social Agent error: ${String(e)}`);
    }

    result.status = result.errors.length === 0 ? "success" : result.scripts.length > 0 ? "partial" : "failed";

    return result;
  }

  async generateQuickContent(
    product: string,
    platform: Platform,
    concept: string
  ): Promise<{
    script: Awaited<ReturnType<typeof scriptStudio.writeScript>>;
    prompts: Awaited<ReturnType<typeof promptDirector.scriptToPrompts>>;
    caption: Awaited<ReturnType<typeof socialAgent.writeCaption>>;
    qa: Awaited<ReturnType<typeof qaCritic.reviewScript>>;
  }> {
    const script = await scriptStudio.writeScript({
      product,
      platform,
      style: "LIFESTYLE_BEACH",
      objective: concept,
    });

    const [promptPkg, caption, qa] = await Promise.all([
      promptDirector.scriptToPrompts(script, product, "vibrant"),
      socialAgent.writeCaption({
        product,
        platform,
        visual_description: concept,
      }),
      qaCritic.reviewScript(script),
    ]);

    return { script, prompts: promptPkg, caption, qa };
  }
}

export const orchestrator = new CampaignOrchestrator();

export {
  productGuardian,
  brandDirector,
  scriptStudio,
  promptDirector,
  socialAgent,
  qaCritic,
};

export default orchestrator;
