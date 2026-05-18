import Link from "next/link";
import Logo from "@/app/components/Logo";

export default function ConfirmPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative w-full max-w-md animate-fade-up">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="logo-link">
            <Logo size={28} />
            <span>Claim<span style={{ opacity: 0.5 }}>.</span>e</span>
          </Link>
        </div>

        <div className="glass-card p-10 text-center">
          {/* Icône email */}
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📧</span>
          </div>

          <h1 className="font-display text-2xl font-700 text-white mb-3">
            Vérifiez votre email
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Nous vous avons envoyé un email de confirmation.
            Cliquez sur le lien dans l'email pour activer votre compte.
          </p>

          {/* Étapes */}
          <div className="text-left space-y-3 mb-8">
            {[
              { num: "1", text: "Ouvrez votre boîte mail" },
              { num: "2", text: "Trouvez l'email de Claim.e" },
              { num: "3", text: "Cliquez sur le lien de confirmation" },
              { num: "4", text: "Connectez-vous à votre dashboard" },
            ].map(({ num, text }) => (
              <div key={num} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-400 text-xs font-700">{num}</span>
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>

          {/* Alerte spam */}
          <div className="px-4 py-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-sm text-orange-400 mb-6">
            💡 Vérifiez vos spams si vous ne recevez pas l'email.
          </div>

          <div className="space-y-3">
            <Link href="/login" className="btn btn-primary w-full justify-center py-3">
              J'ai confirmé mon email → Se connecter
            </Link>
            <Link href="/signup" className="btn btn-ghost w-full justify-center text-sm">
              ← Retour à l'inscription
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}