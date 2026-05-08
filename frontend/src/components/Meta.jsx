import React from 'react';
import { Helmet } from 'react-helmet-async';

// Gán giá trị mặc định ngay tại đây (Modern Javascript)
const Meta = ({ 
  title = 'In Quang Phát - Xưởng In Ấn Bao Bì Giá Rẻ, Chất Lượng', 
  description = 'Chuyên thiết kế và in ấn hộp giấy, túi giấy, bao bì sản phẩm chất lượng cao. Giá rẻ tận xưởng, giao hàng toàn quốc.', 
  keywords = 'in ấn, hộp giấy, túi giấy, in quang phát, bao bì giá rẻ, in offset' 
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
    </Helmet>
  );
};

export default Meta;