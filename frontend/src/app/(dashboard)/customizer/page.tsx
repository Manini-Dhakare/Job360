import { TwoPanelEditor } from "@/components/modules/customizer/TwoPanelEditor";

export default function CustomizerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-slate">Two-Panel Resume Customizer</h1>
        <p className="text-sm text-brand-muted">
          Jobright-inspired anti-fabrication STAR bullet rewriting studio.
        </p>
      </div>
      <TwoPanelEditor />
    </div>
  );
}
