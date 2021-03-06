/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect, useState } from 'react';
import './RoadmapList.css';
import gql from 'graphql-tag';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPalette, faLaptop, faUserTie, faLaptopCode,
  faClipboardList, faBook, faBullseye, faHeartbeat,
  faMusic, faDumbbell, faSitemap,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useApolloClient, useQuery } from '@apollo/react-hooks';

const GET_ROADMAPS = gql`
query roadmaps($category: String, $title: String, $offset: Int, $limit: Int) {
  roadmaps (category: $category, title: $title, offset: $offset, limit: $limit) {
    id
    title
    category
    UserId
    user {
      name
    }
  }
}
`;

interface Iuser {
  name: string,
}

interface IRoadmap {
  title: string;
  id: string;
  category: string;
  UserId: string;
  user: Iuser;
  __typename: string;
}

interface RoadmapListProps {
  searchInput: string;
  currCategory: string;
}

const RoadmapList: React.FC<RoadmapListProps> = ({ searchInput, currCategory }) => {
  const client = useApolloClient();
  const [showButton, setShowButton] = useState(true);
  // fetching roadmaps from database

  const {
    data,
    loading,
    refetch,
    fetchMore,
  } = useQuery(GET_ROADMAPS);

  // filter for clicked category only
  const renderCategories = (clickedCat: string) => {
    // setCurrCategory(clickedCat);
    if (clickedCat === 'Popular') {
      refetch({ category: '' });
    } else {
      refetch({ category: clickedCat });
    }
  };

  const renderSearchResults = () => {
    if (currCategory === 'Popular' || currCategory === '') {
      refetch({ title: searchInput });
    } else {
      refetch({ title: searchInput, category: currCategory });
    }
  };

  const handleNext = () => {
    fetchMore({
      variables: { offset: data.roadmaps.length },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        if (fetchMoreResult.length < 20) setShowButton(false);
        return { ...prev, roadmaps: [...prev.roadmaps, ...fetchMoreResult.roadmaps] };
      },
    });
  };

  // on click render roadmaps of this category
  useEffect(() => {
    renderCategories(currCategory);
  }, [currCategory]);

  // render when user types in searchbar only
  useEffect(() => {
    renderSearchResults();
  }, [searchInput]);

  if (loading) return null;
  if (data.roadmaps.length < 20 && showButton) setShowButton(false);
  const roadmaps = data && data.roadmaps.map((item: IRoadmap) => {
    let icon;
    switch (item.category) {
      case 'Development':
        icon = faLaptopCode;
        break;
      case 'Business':
        icon = faUserTie;
        break;
      case 'IT&Software':
        icon = faLaptop;
        break;
      case 'Office Productivity':
        icon = faClipboardList;
        break;
      case 'Personal Development':
        icon = faBook;
        break;
      case 'Design':
        icon = faPalette;
        break;
      case 'Marketing':
        icon = faBullseye;
        break;
      case 'Health&Fitness':
        icon = faHeartbeat;
        break;
      case 'Music':
        icon = faMusic;
        break;
      case 'Sports':
        icon = faDumbbell;
        break;
      default:
        icon = faSitemap;
    }
    return (
      <Link
        className="roadmap-container fade-in"
        id="roadmaps"
        key={item.id}
        to={`/preview/${item.id}`}
        onClick={() => client.writeData({
          data: {
            selectedRoadmapUID: item.UserId,
          },
        })}
      >
        <div id="middle">
          <FontAwesomeIcon icon={icon} className="category-icon" />
          <div id="discover-title">{item.title}</div>
          <div id="discover-user"><p>{item.user.name}</p></div>
        </div>
      </Link>
    );
  });

  return (
    <div>
      <div className="discover-list-container">
        {roadmaps}
      </div>
      <div id="load-more-button">
        {data.roadmaps.length === 20 && <button type="button" onClick={handleNext}>Load More</button>}
      </div>
    </div>
  );
};

RoadmapList.propTypes = {
  searchInput: PropTypes.string.isRequired,
  currCategory: PropTypes.string.isRequired,
};


export default RoadmapList;
