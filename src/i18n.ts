import i18next from "i18next";
import { initReactI18next } from "react-i18next";

//Import all translation files
import translationEnglish from "./translation/english/translation.json";
import translationFrench from "./translation/french/translation.json";
import translationLatin from "./translation/latin/translation.json";

const resources = {
  en: {
    translation: translationEnglish,
  },
  fr: {
    translation: translationFrench,
  },
  latin: {
    translation: translationLatin,
  },
};

i18next.use(initReactI18next).init({
  resources,
  lng: "en", //default language
});

export default i18next;
