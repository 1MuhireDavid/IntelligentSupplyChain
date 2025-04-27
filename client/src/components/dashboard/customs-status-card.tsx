import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomsDocument } from '@shared/schema';

interface CustomsStatusCardProps {
  documents?: CustomsDocument[];
}

export default function CustomsStatusCard({ documents }: CustomsStatusCardProps) {
  if (!documents || documents.length === 0) {
    return (
      <Card className="border-neutral-100">
        <CardHeader className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <CardTitle className="text-base font-semibold">Customs Management</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">View All</Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-8 text-neutral-500">
            No customs documents found. Create your first document to track customs clearance.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-neutral-100">
      <CardHeader className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <CardTitle className="text-base font-semibold">Customs Management</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">View All</Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {documents.slice(0, 3).map((doc) => (
            <div key={doc.id} className="p-3 border border-neutral-100 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-neutral-800">{doc.title}</h3>
                  <p className="text-sm text-neutral-600 mt-1">Destination: {doc.destination}</p>
                </div>
                <span className={`px-2 py-1 ${
                  doc.status === 'cleared' ? 'bg-success bg-opacity-10 text-success' :
                  doc.status === 'in progress' ? 'bg-warning bg-opacity-10 text-warning' :
                  'bg-neutral-200 text-neutral-600'
                } text-xs rounded-full`}>
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </span>
              </div>
              <div className="mt-2 flex items-center text-sm text-neutral-500">
                <span className="material-icons text-sm mr-1">
                  {doc.status === 'cleared' ? 'event' :
                   doc.status === 'in progress' ? 'error_outline' :
                   'schedule'}
                </span>
                {doc.status === 'cleared' && doc.clearanceDate && (
                  <>Cleared on: {new Date(doc.clearanceDate).toLocaleDateString()}</>
                )}
                {doc.status === 'in progress' && (
                  <>Missing documentation</>
                )}
                {doc.status === 'pending' && (
                  <>Expected: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</>
                )}
              </div>
              <div className="mt-3 w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-1 rounded-full ${
                    doc.status === 'cleared' ? 'bg-success' :
                    doc.status === 'in progress' ? 'bg-warning' :
                    'bg-neutral-400'
                  }`} 
                  style={{ width: `${doc.progress}%` }}
                ></div>
              </div>
            </div>
          ))}

          <Button variant="ghost" size="sm" className="w-full py-2 text-center text-primary hover:text-primary-600 font-medium focus:outline-none">
            Generate Customs Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
