import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { TextLink } from '@/components/ui/TextLink';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Accordion } from '@/src/programmes/components/Accordion';
import { OnThisPage } from '@/src/programmes/components/OnThisPage';
import { Page } from '@/src/programmes/components/Page';
import { RowGroup } from '@/src/programmes/components/PartyRow';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { METHODOLOGY_ANCHORS } from '@/src/programmes/models/on-this-page';
import type { Source } from '@/src/programmes/models/programme.model';
import { methodologyMeta } from '@/src/programmes/models/seo/page-meta';
import { methodologyViewModel } from '@/src/programmes/view-models/methodology.view-model';

const COMMITMENTS = [
  { icon: 'checkmark', title: 'Chaque information a sa source', text: 'Avec sa date et sa nature' },
  {
    icon: 'calendar-outline',
    title: 'Les programmes sont datés',
    text: 'Un programme pas encore publié est signalé',
  },
  {
    icon: 'people-outline',
    title: 'Même traitement pour tous',
    text: 'Mêmes thèmes, ordre alphabétique',
  },
  {
    icon: 'help-circle-outline',
    title: 'Pas de position devinée',
    text: "Un trou plutôt qu'une approximation",
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Vos réponses restent chez vous',
    text: "Le site est statique, rien n'est envoyé",
  },
  {
    icon: 'phone-portrait-outline',
    title: 'Données personnelles',
    text: "Votre progression de lecture reste sur votre appareil, sans vos réponses au questionnaire. Vous pouvez l'effacer depuis l'accueil. Vos réponses au questionnaire ne sont jamais enregistrées. Si vous le demandez, le lien personnel de résultats les place après le « # » de l'adresse, une partie que le navigateur n'envoie à aucun serveur, et l'e-mail récapitulatif est un brouillon ouvert dans votre messagerie, qui l'envoie elle-même : ni l'un ni l'autre ne passe par Polithèque. Ce lien et cet e-mail contiennent vos réponses, à ne partager qu'avec qui vous voulez.",
  },
];

type Rule = {
  title: string;
  body: string;
  extra?: readonly string[];
  link?: { label: string; href: string };
};

const rulesWith = (methodSentences: readonly string[]): Rule[] => [
  {
    title: 'Comment les 4 idées de chaque parti sont choisies',
    body: "C'est le seul endroit d'une fiche où l'on choisit ; le choix est encadré et identique pour les dix partis. Chaque parti a exactement 4 idées, de 4 thèmes différents, toujours rangées dans l'ordre des thèmes du site : l'ordre ne dit rien du parti. Chaque idée reprend une mesure déjà présente dans le programme de la fiche, formulée dans les termes du parti (les mots connotés restent entre guillemets), sans chiffre ni mesure ajoutés. On retient d'abord ce que le parti ou son candidat présente lui-même comme prioritaire, puis une mesure liée à une question où sa position est explicite ; à égalité, la source la plus forte et la plus récente. Chaque idée est appuyée par au moins 2 sources de sites différents, dont une indépendante du parti, prises parmi celles de la mesure et de ses questions liées. Une idée qui n'atteint pas ce seuil n'est pas publiée. L'origine affichée (« Programme, mars 2022 ») n'efface jamais l'âge de la source. Les questions de « Pour ou contre ? » sont les mêmes pour les dix partis : pour chaque thème, la première question à laquelle tous ont une position.",
  },
  {
    title: 'Les programmes de 2027 pas encore publiés',
    body: "À la date de vérification, la plupart des candidats n'ont pas publié leur programme définitif. Chaque fiche l'indique et s'appuie sur le dernier programme officiel (législatives 2024, européennes 2024, présidentielle 2022) et sur les déclarations récentes, toujours datées.",
  },
  {
    title: 'Le calcul de proximité',
    extra: methodSentences,
    body: "Pour chaque question, l'écart entre votre réponse et la position du parti (de −2 à +2) donne un accord de 0 à 100 %. Exemple : vous répondez « Plutôt d'accord » (+1) et le parti est « Pour » (+2) : écart de 1, accord de 75 %. La moyenne est pondérée : une question « compte double » pèse deux fois. Les questions sans avis, ou sans position connue du parti, sont ignorées ; le nombre de questions comparées est toujours affiché. Un pourcentage de proximité n'est calculé qu'à partir de 5 questions comparables ; en dessous, le parti n'est pas noté. L'arc est tracé en pointillés lorsque la comparaison porte sur moins de 15 questions : le résultat est alors moins solide.",
  },
  {
    title: 'Les axes de la carte',
    body: "Chaque affirmation peut être rattachée à un axe (économie, société, Europe) avec un sens. Votre position sur un axe est la moyenne de vos réponses sur ces affirmations. Certaines questions ne sont rattachées à aucun axe parce qu'elles ne s'y rangent pas clairement (énergie, normes agricoles, ZFE, médecins, livraisons d'armes à l'Ukraine, proportionnelle) ; elles comptent quand même dans la proximité. L'axe Europe mesure les transferts de souveraineté vers l'Union (primauté du droit européen, veto, emprunt commun, élargissement), pas l'attachement général à l'Europe. Une position de parti sur un axe n'est calculée qu'à partir de 4 positions rattachées à cet axe ; en dessous, le parti n'y figure pas. L'ordre des partis sur chaque axe a été comparé à l'enquête d'experts Chapel Hill Expert Survey 2024 : il concorde en économie et en société.",
  },
  {
    title: 'Les étiquettes politiques',
    body: "Les qualifications (« extrême droite », « gauche radicale »…) suivent l'usage de la presse de référence, des politistes et du nuancier du ministère de l'Intérieur. La position du parti sur sa propre étiquette est indiquée lorsqu'elle est publique.",
  },
  {
    title: 'Moteurs de recherche et intelligence artificielle',
    body: "Le site est ouvert aux moteurs de recherche et aux assistants qui citent leurs sources (Google, Bing, ChatGPT, Perplexity, Claude…). Il n'interdit pas non plus aux robots d'entraînement des modèles d'IA de lire ses pages : une information sourcée et neutre sur la vie politique a vocation à circuler. Ce choix est inscrit dans le fichier robots.txt et peut être revu ; il ne change rien à la règle des sources, ni au fait que vos réponses au questionnaire ne quittent jamais votre appareil.",
  },
  {
    title: 'Corrections',
    body: 'Les données sont versionnées et chaque correction est datée. Une erreur signalée avec une source est vérifiée puis corrigée. Chaque modification de fond est inscrite au journal public.',
    link: { label: 'Voir le journal des corrections', href: '/corrections' },
  },
];

const EXAMPLE: Record<'croisee' | 'unique', Source[]> = {
  croisee: [
    {
      title: 'Exemple : programme officiel',
      url: 'https://exemple-parti.fr',
      date: '2026-01',
      kind: 'programme',
    },
    {
      title: 'Exemple : article de presse',
      url: 'https://exemple-journal.fr',
      date: '2026-01',
      kind: 'presse',
    },
  ],
  unique: [
    {
      title: 'Exemple : déclaration',
      url: 'https://exemple-parti.fr',
      date: '2026-01',
      kind: 'declaration',
    },
  ],
};

const META = methodologyMeta();

export default function MethodologyScreen() {
  const { colors, effects, fonts } = useTheme();
  const vm = useViewModel(methodologyViewModel);
  return (
    <Page meta={META} back={{ label: 'Retour', href: '/' }}>
      <View style={{ gap: 6 }}>
        <Text variant="title">Méthodologie</Text>
        <Text style={{ color: colors.text.secondary, fontSize: 17 }}>
          Comment les informations sont choisies, vérifiées et présentées.
        </Text>
      </View>

      <OnThisPage items={METHODOLOGY_ANCHORS} />

      <RowGroup>
        {COMMITMENTS.map((item, index) => (
          <View
            key={item.title}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: effects.spacing.smd,
              padding: effects.spacing.md,
              borderTopWidth: index === 0 ? 0 : 1,
              borderColor: colors.surface.border.primary,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: effects.borderRadius.round,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.tintSoft,
              }}
            >
              <Icon name={item.icon} variant="onGlass" size="small" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...fonts.bold, fontSize: 16 }}>{item.title}</Text>
              <Text style={{ color: colors.text.secondary, fontSize: 14 }}>{item.text}</Text>
            </View>
          </View>
        ))}
      </RowGroup>

      <View
        nativeID="niveaux-de-source"
        style={{
          gap: effects.spacing.sm,
          backgroundColor: colors.surface.primary,
          borderRadius: effects.borderRadius.small,
          borderWidth: 1,
          borderColor: colors.surface.border.primary,
          padding: effects.spacing.md,
        }}
      >
        <Text variant="caption" headingLevel={2}>
          Les niveaux de source
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <SourceChip sources={EXAMPLE.croisee} />
          <Text style={{ flex: 1, fontSize: 15 }}>
            Recoupée : au moins 2 sites différents, dont un indépendant du parti
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <SourceChip sources={EXAMPLE.unique} />
          <Text style={{ flex: 1, fontSize: 15 }}>Source unique : une seule source trouvée</Text>
        </View>
      </View>

      <View nativeID="regles" style={{ gap: effects.spacing.xs }}>
        {rulesWith(vm.methodSentences).map((rule) => (
          <Accordion key={rule.title} title={rule.title} headingLevel={2}>
            <Text style={{ fontSize: 16, lineHeight: 25 }}>{rule.body}</Text>
            {rule.extra?.map((sentence) => (
              <Text key={sentence} style={{ fontSize: 16, lineHeight: 25 }}>
                {sentence}
              </Text>
            ))}
            {rule.link ? (
              <TextLink href={rule.link.href} size={16} standalone>
                {rule.link.label}
              </TextLink>
            ) : null}
          </Accordion>
        ))}
      </View>

      <View nativeID="comment-lire" style={{ gap: effects.spacing.sm }}>
        <Text variant="title" headingLevel={2} style={{ fontSize: 24, lineHeight: 30 }}>
          Comment lire les pages
        </Text>
        {vm.readingGuides.map((guide) => (
          <View key={guide.anchor} id={guide.anchor} style={{ gap: effects.spacing.xs }}>
            <Text variant="display" headingLevel={3}>
              {guide.title}
            </Text>
            {guide.paragraphs.map((paragraph) => (
              <Text key={paragraph} style={{ fontSize: 16, lineHeight: 25 }}>
                {paragraph}
              </Text>
            ))}
            {guide.bullets?.map((bullet) => (
              <Text key={bullet} style={{ fontSize: 16, lineHeight: 25, paddingLeft: 8 }}>
                {`• ${bullet}`}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <View nativeID="votes-assemblee" id="votes-assemblee" style={{ gap: effects.spacing.sm }}>
        <Text variant="title" headingLevel={2} style={{ fontSize: 24, lineHeight: 30 }}>
          {vm.assemblee.title}
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 25 }}>{vm.assemblee.intro}</Text>
        <Text variant="display" headingLevel={3}>
          {vm.assemblee.criteriaTitle}
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 25 }}>{vm.assemblee.criteriaLead}</Text>
        {vm.assemblee.rules.map((rule) => (
          <Text key={rule} style={{ fontSize: 16, lineHeight: 25, paddingLeft: 8 }}>
            {`• ${rule}`}
          </Text>
        ))}
        <Text style={{ fontSize: 16, lineHeight: 25 }}>{vm.assemblee.criteriaExcluded}</Text>
        <Text variant="display" headingLevel={3}>
          {vm.assemblee.sourceTitle}
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 25 }}>{vm.assemblee.source}</Text>
        {vm.assemblee.extraction ? (
          <Text style={{ fontSize: 15, lineHeight: 23, color: colors.text.secondary }}>
            {vm.assemblee.extraction}
          </Text>
        ) : null}
        <Text variant="display" headingLevel={3}>
          {vm.assemblee.limitsTitle}
        </Text>
        {vm.assemblee.limits.map((limit) => (
          <Text key={limit} style={{ fontSize: 16, lineHeight: 25, paddingLeft: 8 }}>
            {`• ${limit}`}
          </Text>
        ))}
        <TextLink href={vm.assemblee.article493Source.href} size={16} standalone>
          {vm.assemblee.article493Source.label}
        </TextLink>
        <Text style={{ fontSize: 16, lineHeight: 25 }}>{vm.assemblee.neutrality}</Text>
        <TextLink href={vm.assemblee.link.href} size={16} standalone>
          {vm.assemblee.link.label}
        </TextLink>
      </View>
    </Page>
  );
}
