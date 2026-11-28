import { TwoPanelEditor } from "@/components/modules/customizer/TwoPanelEditor";
import { PageHeader } from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Card";

export default function CustomizerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Two-Panel Resume Customizer"
        badge={<Badge variant="emerald">Anti-Fabrication AI</Badge>}
        description="Reconcile your verified resume assets against target job requirements and generate STAR-formatted bullets."
      />
      <TwoPanelEditor />
    </div>
  );
}
