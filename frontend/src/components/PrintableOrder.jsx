import React from 'react';
import { createPortal } from 'react-dom';

const PrintableOrder = ({ order }) => {
  if (!order) return null;

  const isOffset = order.printType === 'offset';

  const content = (
    <div className="print-container w-full text-black font-sans bg-white relative" style={{ margin: 0, padding: 0 }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider">CÔNG TY TNHH IN QUANG PHÁT</h1>
          <p className="text-sm">Hotline: 0935127686 | 0903597686 | 0935110639 | Email: inquangphat@gmail.com</p>
          <p className="text-sm">Địa chỉ: Số 5, Đường số 4, Cụm CN An Hoà, phường Hương An, Huế</p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-black uppercase tracking-widest mt-2">LỆNH SẢN XUẤT</h2>
          <p className="text-sm mt-1 font-bold">Mã số: {order.orderCode}</p>
          <p className="text-sm">Ngày lập: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
        </div>
      </div>

      {/* Thông tin chung */}
      <div className="mb-6">
        <table className="w-full text-sm border-collapse">
          <tbody>
            <tr>
              <td className="w-1/4 py-1 font-bold">Tên Khách hàng / Lệnh:</td>
              <td className="w-3/4 py-1 font-bold text-lg">{order.orderName}</td>
            </tr>
            <tr>
              <td className="py-1 font-bold">Tổng số lượng:</td>
              <td className="py-1">{order.totalQuantity?.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="py-1 font-bold">Kỹ thuật in chính:</td>
              <td className="py-1 uppercase font-bold">{isOffset ? 'In Offset' : 'In Lụa'}</td>
            </tr>
            {order.notes && (
              <tr>
                <td className="py-1 font-bold align-top">Ghi chú chung:</td>
                <td className="py-1 whitespace-pre-wrap">{order.notes}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Chi tiết bài in / quy trình */}
      <h3 className="text-base font-bold mb-3 uppercase border-b border-gray-300 pb-1">Chi tiết các cấu thành (Bài in)</h3>
      <div className="mb-8">
        <table className="w-full text-sm border border-black border-collapse">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="border border-black p-2 w-8">TT</th>
              <th className="border border-black p-2 w-1/5">Tên chi tiết</th>
              <th className="border border-black p-2">Thông số / Giấy / Khổ</th>
              <th className="border border-black p-2">Gia công & Ghi chú</th>
              <th className="border border-black p-2 w-48">Ảnh / Mẫu</th>
            </tr>
          </thead>
          <tbody>
            {(order.printJobs || []).map((job, idx) => (
              <tr key={idx}>
                <td className="border border-black p-2 text-center font-bold">{idx + 1}</td>
                <td className="border border-black p-2 font-bold">{job.jobName}</td>
                <td className="border border-black p-2">
                  <div className="space-y-1">
                    {job.material && <p><strong>Vật liệu:</strong> {job.material}</p>}
                    {job.printSize && <p><strong>Khổ:</strong> {job.printSize}</p>}
                    {job.plateSize && <p><strong>Kẽm/Khuôn:</strong> {job.plateSize}</p>}
                    {job.quantity && <p><strong>S.Lượng:</strong> {job.quantity.toLocaleString()}</p>}
                    {job.printColors && <p><strong>Số màu:</strong> {job.printColors}</p>}
                  </div>
                </td>
                <td className="border border-black p-2">
                  <div className="space-y-2">
                    {job.postProcess && job.postProcess.length > 0 && (
                      <p><strong>Gia công:</strong> {job.postProcess.join(', ')}</p>
                    )}
                    {job.notes && <p className="whitespace-pre-wrap text-xs"><strong>Ghi chú:</strong><br />{job.notes}</p>}
                  </div>
                </td>
                <td className="border border-black p-2 text-center align-middle">
                  {job.image ? (
                    <img src={job.image} alt="Artwork" className="max-w-full max-h-32 object-contain mx-auto mix-blend-multiply" />
                  ) : (
                    <span className="text-gray-400 italic text-xs">Không có ảnh mẫu</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Chữ ký */}
      <div className="mt-12 flex justify-between px-10 text-center text-sm">
        <div>
          <p className="font-bold mb-16">Người Lập Lệnh</p>
          <p className="border-t border-black pt-1 w-32 mx-auto">(Ký & ghi rõ họ tên)</p>
        </div>
        <div>
          <p className="font-bold mb-16">Quản Đốc Xưởng</p>
          <p className="border-t border-black pt-1 w-32 mx-auto">(Ký & ghi rõ họ tên)</p>
        </div>
        <div>
          <p className="font-bold mb-16">Giám Đốc</p>
          <p className="border-t border-black pt-1 w-32 mx-auto">(Ký & ghi rõ họ tên)</p>
        </div>
      </div>

      <style>{`
        @media screen {
          .print-container { display: none !important; }
        }
        @media print {
          @page { size: A4; margin: 15mm; }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #root { display: none !important; }
          .print-container { display: block !important; position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );

  return createPortal(content, document.body);
};

export default PrintableOrder;
