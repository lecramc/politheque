import { HOME_VOTE_COPY } from '@/src/programmes/models/home-vote.copy';

describe('Feature: textes du bandeau « dernier grand vote »', () => {
  it('should state the fixed choice rule and keep the links to the votes and to the lesson', () => {
    expect(HOME_VOTE_COPY.title).toBe("Dernier grand vote à l'Assemblée");
    expect(HOME_VOTE_COPY.method).toMatch(/^Le plus récent des grands votes/);
    expect(HOME_VOTE_COPY.allVotesHref).toBe('/assemblee');
    expect(HOME_VOTE_COPY.lawHref).toBe('/comprendre/comment-une-loi-est-votee');
  });

  it('should carry no judgement on the vote', () => {
    const text = Object.values(HOME_VOTE_COPY).join(' ');
    expect(text).not.toMatch(/important|crucial|polémi|controvers|historique|surprenant/i);
  });
});
