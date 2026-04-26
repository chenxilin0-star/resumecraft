export const FREE_TEMPLATE_IDS = [
  'minimal-classic',
  'business-blue',
  'modern-split',
  'fresh-green',
  'internet-style',
] as const;

export const FREE_AI_DAILY_LIMIT = 2;
export const DAILY_IP_REGISTRATION_LIMIT = 2;

export function isFreeTemplateId(templateId: string): boolean {
  return FREE_TEMPLATE_IDS.includes(templateId as typeof FREE_TEMPLATE_IDS[number]);
}

export function canUseTemplate(templateId: string, isVipOrAdmin: boolean): boolean {
  if (isFreeTemplateId(templateId)) return true;
  return isVipOrAdmin;
}

export function getTemplateAccessMessage(templateId: string): string {
  if (isFreeTemplateId(templateId)) return '';
  return '该模板为 VIP 专属，请先开通会员';
}

export function isIpRegistrationAllowed(todayCount: number): boolean {
  return todayCount < DAILY_IP_REGISTRATION_LIMIT;
}
