import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import blogLeadFollowup from "@/assets/blog/blog-lead-followup.jpg";
import blogNfcNetworking from "@/assets/blog/blog-nfc-networking.jpg";
import blogProfessionalProfile from "@/assets/blog/blog-professional-profile.jpg";

const getBlogPosts = (isPt: boolean) => [
  {
    category: isPt ? "EVENTOS & NETWORKING" : "EVENTS & NETWORKING",
    description: isPt
      ? "Aprenda estratégias eficazes para fazer follow-up e organizar leads após eventos."
      : "Learn effective strategies to follow-up and organize leads after events.",
    image: blogLeadFollowup,
    publishDate: isPt ? "15 Mai, 2025" : "May 15, 2025",
    slug: "follow-up-leads-pos-evento",
    title: isPt
      ? "Follow-Up de Leads Pós-Evento: O Guia Definitivo"
      : "Post-Event Lead Follow-Up: The Definitive Guide",
  },
  {
    category: isPt ? "TECNOLOGIA" : "TECHNOLOGY",
    description: isPt
      ? "Descubra como a tecnologia NFC está a revolucionar o networking profissional."
      : "Discover how NFC technology is revolutionizing professional networking.",
    image: blogNfcNetworking,
    publishDate: isPt ? "10 Abr, 2025" : "Apr 10, 2025",
    slug: "boost-networking-with-nfc",
    title: isPt
      ? "Como Impulsionar o Networking com NFC"
      : "Boost Your Networking with NFC Technology",
  },
  {
    category: isPt ? "CARREIRA" : "CAREER",
    description: isPt
      ? "Guia completo sobre como criar um perfil profissional que impressiona."
      : "Complete guide on how to create a professional profile that impresses.",
    image: blogProfessionalProfile,
    publishDate: isPt ? "20 Abr, 2025" : "Apr 20, 2025",
    slug: "digital-business-cards-guide",
    title: isPt
      ? "Dicas para um Perfil Profissional Perfeito"
      : "Tips for a Perfect Professional Profile",
  },
];

export default function BlogSection() {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);
  const articles = getBlogPosts(isPt);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              Blog
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 text-foreground">
              {isPt ? "Artigos & Insights" : "Articles & Insights"}
            </h2>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline transition-all group w-fit"
          >
            {isPt ? "Ver todos os artigos" : "View all articles"}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <Link
              key={index}
              to={`/blog/${article.slug}`}
              className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold tracking-wider bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full">
                    #{article.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-6">
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                  {article.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    {isPt ? "Ler mais" : "Read more"}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {article.publishDate}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
