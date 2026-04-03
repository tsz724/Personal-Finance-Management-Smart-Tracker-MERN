import React ,{ createContext, useState } from 'react';

// eslint-disable-next-line react-refresh/only-export-components -- provider co-located
export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Function to update user information
    const updateUser = (userData) => {
        setUser(userData);
    };

    // Function to clear user information (e.g., on logout)
    const clearUser = () => {
        setUser(null);
    };
    return (
        <UserContext.Provider value={{ user, updateUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
}

export default UserProvider;
