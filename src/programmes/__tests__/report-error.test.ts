import { REPORT_COPY } from '@/src/programmes/models/report-error.copy';
import { buildReportLinks } from '@/src/programmes/models/report-error.service';
import { MAILTO_MAX_LENGTH } from '@/src/programmes/models/results-recap.service';

const base = {
  pathname: '/partis/lfi/programme-2027',
  title: 'La France insoumise : programme 2027',
  indexable: true,
  email: null as string | null,
};

const bodyOf = (url: string) => new URL(url).searchParams.get('body') ?? '';

describe('Feature: signaler une erreur', () => {
  it('should offer only the GitHub issue while no e-mail address exists', () => {
    const links = buildReportLinks(base);
    expect(links?.mailto).toBeNull();
    expect(links?.github.startsWith('https://github.com/lecramc/politheque/issues/new?')).toBe(
      true
    );
  });

  it('should offer a prefilled mailto when an address exists', () => {
    const links = buildReportLinks({ ...base, email: 'contact@exemple.fr' });
    expect(links?.mailto?.startsWith('mailto:contact@exemple.fr?subject=')).toBe(true);
    expect(links?.mailto).toContain(encodeURIComponent(REPORT_COPY.inexactField));
  });

  it('should prefill the full page address, the title and the fields to fill', () => {
    const body = bodyOf(buildReportLinks(base)!.github);
    expect(body).toContain('https://politheque.revaamp.com/partis/lfi/programme-2027');
    expect(body).toContain(base.title);
    expect(body).toContain(REPORT_COPY.inexactField);
    expect(body).toContain(REPORT_COPY.sourceField);
  });

  it('should carry the title in the GitHub issue title', () => {
    expect(new URL(buildReportLinks(base)!.github).searchParams.get('title')).toBe(
      `${REPORT_COPY.subjectPrefix}${base.title}`
    );
  });

  it('should show nothing on non indexable pages', () => {
    expect(buildReportLinks({ ...base, indexable: false })).toBeNull();
  });

  it('should keep the mailto under the length limit with a very long title', () => {
    const links = buildReportLinks({ ...base, email: 'c@e.fr', title: 'é'.repeat(3000) });
    expect(links!.mailto!.length).toBeLessThan(MAILTO_MAX_LENGTH);
  });
});
