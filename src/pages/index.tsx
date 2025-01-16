import { NextPage } from "next";
import Layout from "@/components/Layout/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { HiOutlineDocument, HiOutlineDotsHorizontal } from "react-icons/hi";
import { Form, FormTranslations, Translation } from "@/types/Form";

const getTranslatedContent = (form: Form, language: string): Form | null => {
  if (language === "en" || !form.translations) {
    return form;
  }

  const translations = form.translations as FormTranslations;
  const currentTranslation = translations[language];

  if (!currentTranslation) return null;

  const questionTranslations = new Map(
    currentTranslation.questions.map((q) => [q.id, q])
  );

  return {
    ...form,
    title: currentTranslation.title,
    description: currentTranslation.description || "",
    welcomeScreen: currentTranslation.welcomeScreen || form.welcomeScreen,
    thankyouScreen: currentTranslation.thankyouScreen || form.thankyouScreen,
    questions: form.questions.map((q) => {
      const translation = questionTranslations.get(q.id);
      if (!translation) return q;

      const baseProperties = q.properties || {};
      const translatedProperties = translation.properties || {};

      return {
        ...q,
        title: translation.title,
        description: translation.description,
        properties: {
          ...baseProperties,
          ...(translation.properties && {
            options:
              translatedProperties.options || baseProperties.options || [],
            maxEmoji:
              translatedProperties.maxEmoji || baseProperties.maxEmoji || "",
            maxLabel:
              translatedProperties.maxLabel || baseProperties.maxLabel || "",
            maxValue:
              translatedProperties.maxValue || baseProperties.maxValue || 0,
            minEmoji:
              translatedProperties.minEmoji || baseProperties.minEmoji || "",
            minLabel:
              translatedProperties.minLabel || baseProperties.minLabel || "",
            minValue:
              translatedProperties.minValue || baseProperties.minValue || 0,
            maxRating:
              translatedProperties.maxRating || baseProperties.maxRating || 5,
            ratingType:
              translatedProperties.ratingType ||
              baseProperties.ratingType ||
              "star",
          }),
        },
      };
    }),
  };
};

const Dashboard: NextPage = (props) => {
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [forms, setForms] = useState<Form[]>([]);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/forms`).then((res) => {
      console.log(res.data);
      setForms(res.data);
    });
  }, []);
  const router = useRouter();

  const handleFormClick = (id: string) => {
    router.push(`/f/${id}`);
  };

  const getTranslatedForms = () => {
    return forms.map(
      (form) => getTranslatedContent(form, currentLanguage) || form
    );
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Meine Formulare
          </h1>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getTranslatedForms().map((form) => (
            <div
              key={form.id}
              className="group relative bg-card hover:bg-accent/50 rounded-lg p-4 transition-colors border border-border hover:border-primary/20 cursor-pointer"
              onClick={() => handleFormClick(form.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <HiOutlineDocument className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-card-foreground">
                      {form.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {form._count?.submissions || 0} Antworten
                    </p>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary rounded-md transition-opacity">
                  <HiOutlineDotsHorizontal className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}

          {/* Empty State */}
          {forms.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-8 bg-card rounded-lg border border-dashed border-border">
              <HiOutlineDocument className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-card-foreground mb-2">
                Noch keine Formulare
              </h3>
              <p className="text-sm text-muted-foreground">
                Erstellen Sie Ihr erstes Formular, um zu beginnen
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
