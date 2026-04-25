import { Link } from 'react-router-dom';
import { FileText, Plus, Clock, Eye, Trash2, Copy } from 'lucide-react';
import FadeIn from '@/components/animations/FadeIn';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function Dashboard() {
  const resumes: Array<{ id: number; title: string; templateName: string; updatedAt: string }> = [];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">我的简历</h1>
              <p className="mt-1 text-gray-500">管理你创建的所有简历</p>
            </div>
            <Link to="/templates">
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                新建简历
              </Button>
            </Link>
          </div>
        </FadeIn>

        {resumes.length === 0 ? (
          <FadeIn>
            <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">还没有简历</h3>
              <p className="mt-2 text-gray-500">从模板中心选择一套模板，开始制作你的第一份简历</p>
              <Link to="/templates" className="inline-block mt-6">
                <Button>去选模板</Button>
              </Link>
            </div>
          </FadeIn>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((r) => (
              <Card key={r.id} hover>
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-300" />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900">{r.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{r.templateName}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {r.updatedAt}
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <button className="p-2 rounded-md hover:bg-gray-100 text-gray-500">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-md hover:bg-gray-100 text-gray-500">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-md hover:bg-gray-100 text-gray-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
