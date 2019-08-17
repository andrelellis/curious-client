import React, { useState } from 'react';
import gql from 'graphql-tag';
import jwtDecode from 'jwt-decode';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks';
import Button from '../../components/Button/Button';
import './MainDashboard.css';
import RoadmapItemForm from '../../components/RoadmapItemForm/RoadmapItemForm';
import Navbar from '../../components/Navbar/Navbar';

interface IRoadmap {
  id: string;
  title: string;
  category: string;
  __typename: string;
}

interface IUserID {
  id: number;
}

// roadmaps (query)
const GET_ROADMAPS = gql`
query getRoadmap($id: ID!) {
  roadmaps(id: $id) {
    id
    title
    category
    topics {
      id
      title
      description
      resources
      completed
      checklist {
        id
        title
        completed
      }
    }
  }
}
`;

const GET_LOCAL_ROADMAPS = gql`
{
  roadmaps {
    id
    title
    category
    topics {
      id
      title
      description
      resources
      completed
      checklist {
        id
        title
        completed
      }
    }    
  }
}
`;

// create roadmap (mutation)
const ADD_ROADMAP = gql`
  mutation createroadmaps($id: ID!, $title: String!, $category: String!) {
    createRoadmap(UserId: $id, title: $title, category: $category) {
      id
      title
      category
    }
  }
`;

// delete roadmap (mutation)
const DELETE_ROADMAP = gql`
  mutation deleteroadmap($id: ID!) {
    deleteRoadmap(id: $id)
  }
`;


const MainDashboard: React.FC = () => {
  const client = useApolloClient();
  const [titleInput, setTitleInput] = useState('');
  const [selectionInput, setSelectionInput] = useState('IT');
  const [flag, setFlag] = useState(false);
  // get userID from cache
  const token: any = localStorage.getItem('token');
  const { id } = jwtDecode(token) || { id: 1 };

  // fetching roadmaps from database
  const { loading, data, refetch } = useQuery(GET_ROADMAPS, {
    variables: { id },
  });
  // adding roadmap
  const [roadmap] = useMutation(ADD_ROADMAP, {
    variables: { id, title: titleInput, category: selectionInput },
  });
  // deleting roadmap
  const [deleteRoadmap]: any = useMutation(DELETE_ROADMAP);

  const routeToDiscover = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('routeToDiscover', e); // eslint-disable-line no-console
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    const { value } = target;
    setTitleInput(value);
  };

  const handleSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { target } = e;
    const { value } = target;
    setSelectionInput(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTitleInput(titleInput);
    const newRoadmap: any = await roadmap();
    const previousRoadmaps: any = client.cache.readQuery({ query: GET_LOCAL_ROADMAPS });
    client.writeData({
      data: { roadmaps: [...previousRoadmaps.roadmaps].concat(newRoadmap.data.createRoadmap) },
    });
    refetch();
    setTitleInput('');
  };

  // const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>, RmID: any) => {
    e.preventDefault();
    await deleteRoadmap({ variables: { id: RmID }, }) && refetch(); // eslint-disable-line
  };

  // check if user has roadmaps created
  if (!data && !flag) {
    return (
      <div>
        <Navbar />
        <div>
          <div className="button-container">
            <Button handleClick={routeToDiscover} value="Browse" />
            <Button handleClick={() => setFlag(true)} value="Add new Roadmap" />
          </div>
        </div>
      </div>
    );
  }
  if (!loading) {
    // store roadmaps in cache and render them on dashboard
    client.writeData({ data: { roadmaps: data.roadmaps } });
    const roadmapsCache = client.readQuery({ query: GET_LOCAL_ROADMAPS });

    const roadmaps = roadmapsCache.roadmaps.map((item: IRoadmap) => { //eslint-disable-line
      return (
        <Link id="roadmaps" key={item.id} to={`/roadmap/${item.id}`}>
          <button
            type="button"
            onClick={(e) => handleDelete(e, item.id)}
          >
            <span role="img" aria-label="delete roadmap button">❌</span>
          </button>
          {item.title}
        </Link>
      );
    });
    return (
      <div>
        <Navbar />
        <div className="container">
          {roadmaps}
          <RoadmapItemForm
            handleChange={handleChange}
            handleSelection={handleSelection}
            handleSubmit={handleSubmit}
            titleInput={titleInput}
          />
        </div>
      </div>
    );
  }
  return (null);
};


export default MainDashboard;
