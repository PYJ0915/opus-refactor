import React from 'react'
import { FadeLoader } from 'react-spinners';

const Loading = () => {
  return (
    <FadeLoader
      color="#000000"
      height={12}
      width={3}
      margin={1}
      radius={5}
      speedMultiplier={0.6}
    />
  );
};


export default Loading;