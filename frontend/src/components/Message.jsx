import React from 'react';
import { Alert } from 'react-bootstrap';

const Message = ({ variant, children }) => {
  return (
    <Alert variant={variant}>
      {children}
    </Alert>
  );
};

// Mặc định là màu xanh (info) nếu không truyền màu
Message.defaultProps = {
  variant: 'info',
};

export default Message;