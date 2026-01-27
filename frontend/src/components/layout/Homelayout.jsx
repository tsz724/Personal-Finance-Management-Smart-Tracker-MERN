import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Homelayout = ({activeMenu, children}) => {
    const {user} = useContext(UserContext);

  return (
    <div className="">
        <Navbar activeMenu={activeMenu} />

          {user &&(
            <div className='flex'>
              <div className='max-[1080px]:hidden'>
                <Sidebar activeMenu={activeMenu}/>
              </div>
              <div className="grow mx-5">{children}</div>
            </div>
          )}
    </div>
  );
}

export default Homelayout;
