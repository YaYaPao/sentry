import {browserHistory, RouteComponentProps} from 'react-router';
import styled from '@emotion/styled';

import Alert from 'sentry/components/alert';
import DatePageFilter from 'sentry/components/datePageFilter';
import EnvironmentPageFilter from 'sentry/components/environmentPageFilter';
import * as Layout from 'sentry/components/layouts/thirds';
import PageFilterBar from 'sentry/components/organizations/pageFilterBar';
import PageFiltersContainer from 'sentry/components/organizations/pageFilters/container';
import {PageHeadingQuestionTooltip} from 'sentry/components/pageHeadingQuestionTooltip';
import Pagination from 'sentry/components/pagination';
import ProjectPageFilter from 'sentry/components/projectPageFilter';
import {hydratedSelectorData} from 'sentry/components/replays/utils';
import SentryDocumentTitle from 'sentry/components/sentryDocumentTitle';
import {t} from 'sentry/locale';
import {space} from 'sentry/styles/space';
import useDeadRageSelectors from 'sentry/utils/replays/hooks/useDeadRageSelectors';
import useOrganization from 'sentry/utils/useOrganization';
import SelectorTable from 'sentry/views/replays/deadRageClick/selectorTable';
import {DeadRageSelectorQueryParams} from 'sentry/views/replays/types';

interface Props extends RouteComponentProps<{}, {}, DeadRageSelectorQueryParams> {}

export default function DeadClickList({location}: Props) {
  const organization = useOrganization();
  const hasDeadClickFeature = organization.features.includes(
    'session-replay-rage-dead-selectors'
  );

  const {isLoading, isError, data, pageLinks} = useDeadRageSelectors({
    per_page: 50,
    sort: '-count_dead_clicks',
    cursor: location.query.cursor,
    prefix: '',
  });

  if (!hasDeadClickFeature) {
    return (
      <Layout.Page withPadding>
        <Alert type="warning">{t("You don't have access to this feature")}</Alert>
      </Layout.Page>
    );
  }

  return (
    <SentryDocumentTitle
      title={t('Top Selectors with Dead Clicks')}
      orgSlug={organization.slug}
    >
      <Layout.Header>
        <Layout.HeaderContent>
          <Layout.Title>
            {t('Top Selectors with Dead Clicks')}
            <PageHeadingQuestionTooltip
              title={t('See the top selectors your users have dead clicked on.')}
              docsUrl="https://docs.sentry.io/product/session-replay/replay-page-and-filters/"
            />
          </Layout.Title>
        </Layout.HeaderContent>
      </Layout.Header>
      <PageFiltersContainer>
        <Layout.Body>
          <Layout.Main fullWidth>
            <LayoutGap>
              <PageFilterBar condensed>
                <ProjectPageFilter resetParamsOnChange={['cursor']} />
                <EnvironmentPageFilter resetParamsOnChange={['cursor']} />
                <DatePageFilter alignDropdown="left" resetParamsOnChange={['cursor']} />
              </PageFilterBar>
              <SelectorTable
                data={hydratedSelectorData(data, 'count_dead_clicks')}
                isError={isError}
                isLoading={isLoading}
                location={location}
                clickCountColumn={{key: 'count_dead_clicks', name: 'dead clicks'}}
                clickCountSortable
              />
            </LayoutGap>
            <PaginationNoMargin
              pageLinks={pageLinks}
              onCursor={(cursor, path, searchQuery) => {
                browserHistory.push({
                  pathname: path,
                  query: {...searchQuery, cursor},
                });
              }}
            />
          </Layout.Main>
        </Layout.Body>
      </PageFiltersContainer>
    </SentryDocumentTitle>
  );
}

const LayoutGap = styled('div')`
  display: grid;
  gap: ${space(2)};
`;

const PaginationNoMargin = styled(Pagination)`
  margin: 0;
`;
