import React, { useState } from 'react';
import gql from 'graphql-tag';
import {
  useQuery,
  useMutation,
  useApolloClient,
} from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import TopicsRow from '../../components/TopicsRow/TopicsRow';
import './RoadmapTree.css';
// Setup query to get all topics for the Roadmap
const GET_TOPICS = gql`
  query gettopics($id: ID!) {
    topics(RoadmapId: $id) {
      id
      title
      rowNumber
    }
}`;

const CREATE_TOPIC = gql`
  mutation createtopic($RoadmapId: ID!, $title: String!, $rowNumber: Int!) {
    createTopic(RoadmapId: $RoadmapId, title: $title, rowNumber: $rowNumber) {
      title
      id
    }
}`;

const DELETE_TOPIC = gql`
  mutation deleteTopic($topicId: ID!) {
    deleteTopic(id: $topicId)
}`;

const COPY_ROADMAP = gql`
mutation copyRoadmap($id: ID!) {
  copyRoadmap(id: $id)
}
`;

interface ITopic {
  id: string
  title: string
  rowNumber: number,
}

interface RoadmapTreeProps {
  matchId: string,
}

interface IRowsData {
  [keys: string]: ITopic[]
}

const RoadmapTree: React.SFC<RoadmapTreeProps> = ({ matchId }) => {
  const client = useApolloClient();
  const [flag, setFlag] = useState(false);

  const { data, loading, refetch } = useQuery(GET_TOPICS, {
    variables: { id: matchId },
  });

  const [copyRoadmap] = useMutation(COPY_ROADMAP, {
    variables: { id: matchId },
  });

  const isPreview = window.location.pathname.includes('preview');

  const [createTopic] = useMutation(CREATE_TOPIC);
  const [deleteTopic] = useMutation(DELETE_TOPIC);
  if (loading) return <p>Loading...</p>;

  const rowsData = data.topics.reduce(
    (obj: IRowsData, topic: ITopic) => {
      const { rowNumber } = topic;
      if (obj[rowNumber]) obj[rowNumber].push(topic);
      else obj[rowNumber] = [topic]; // eslint-disable-line no-param-reassign
      return obj;
    }, {},
  );

  const keys = Object.keys(rowsData);
  const dataLen = keys.length;
  if (dataLen === 0) {
    const arrNum = keys.map((key) => Number(key));
    if (arrNum.length) rowsData[Math.max(...arrNum) + 1] = [];
    else rowsData[0] = [];
  }

  async function handleAddTopic(rowNum: string) {
    try {
      const { data }: any = await createTopic({ // eslint-disable-line no-shadow
        variables: { RoadmapId: matchId, title: '', rowNumber: Number(rowNum) },
      });
      // Get the id of the new topic and save it on cache: property "selectedTopic"
      client.writeData({ data: { selectedTopicId: data.createTopic.id } });
      // TODO: synchronize the title field on topics details with title <p> on Topic component
      await refetch();
    } catch (err) {
      console.log('not possible to create new topic on this row!!'); // eslint-disable-line no-console
    }
  }

  async function handleDeleteTopic(topicId: string) {
    try {
      client.writeData({ data: { selectedTopicId: '' } });
      await deleteTopic({ variables: { topicId } });
      refetch();
    } catch (err) {
      console.log('This topic doesn\'t exist anymore!!'); // eslint-disable-line no-console
    }
  }

  function handleAddRow() {
    const arrNum = keys.map((key) => Number(key));
    const newRowNum = Math.max(...arrNum) + 1;
    const rowNum = newRowNum.toString();
    handleAddTopic(rowNum);
  }

  if (flag) return <Redirect to="/dashboard" />;

  const topicsRows = Object.keys(rowsData).map((rowNumber) => (
    <TopicsRow
      isPreview={isPreview}
      topics={rowsData[rowNumber]}
      key={rowNumber}
      rowNum={rowNumber}
      handleAddTopic={handleAddTopic}
      handleDeleteTopic={handleDeleteTopic}
    />
  ));
  const buttonAddRow = dataLen > 0 && (
    <div className="flex-container">
      <button className="add-row__btn" type="button" onClick={handleAddRow}>
        <FontAwesomeIcon icon={faPlus} />
      </button>
      <p className="ARlabel">Add Row</p>
    </div>
  );
  return (
    <>
      <div className={isPreview ? 'preview-pos' : 'preview-pos not-preview'}>
        {(isPreview)
          ? (
            <div className="copy__container">
              <button
                type="button"
                onClick={() => { copyRoadmap().then(() => setFlag(true)); }}
                className="copy__btn"
              >
                <FontAwesomeIcon className="copy-roadmap" icon={faCopy} />
                <p className="copy__label">Copy Roadmap</p>
              </button>
            </div>
          ) : null}
        <div>
          {topicsRows}
        </div>
      </div>
      {(!isPreview) ? <div className="AR__container">{buttonAddRow}</div> : null}
    </>
  );
};

RoadmapTree.propTypes = {
  matchId: PropTypes.string.isRequired,
};

export default RoadmapTree;
