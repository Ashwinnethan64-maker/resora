import { GET as apiHealthGet } from '@/app/api/health/route';

export async function GET() {
  return apiHealthGet();
}
