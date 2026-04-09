import React, { useEffect } from 'react';
import { FaAward, FaUsers, FaPrint, FaHistory, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Meta from '../components/Meta';

const AboutScreen = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-[#F9FAFB] min-h-screen font-sans text-[#111827]">
            <Meta title="Về chúng tôi | In Quang Phát - Lịch sử hình thành & Phát triển" />

            {/* 1. BANNER GIỚI THIỆU - Tối giản */}
            <div className="bg-white border-b border-gray-200 py-16 md:py-24">
                <div className="container mx-auto px-4 text-center max-w-3xl">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#E6F0ED] text-[#006B4D] uppercase tracking-widest mb-4">
                        Giới thiệu
                    </span>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-[#111827] mb-6 tracking-tight">Câu chuyện của chúng tôi</h1>
                    <p className="text-[#6B7280] text-lg leading-relaxed">
                        Hơn 20 năm nỗ lực không ngừng nghỉ để trở thành biểu tượng niềm tin trong ngành in ấn bao bì & may mặc tại Việt Nam.
                    </p>
                </div>
            </div>

            {/* 2. GIỚI THIỆU CHUNG (Sứ mệnh - Tầm nhìn) */}
            <div className="container mx-auto px-4 py-16 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-[#E6F0ED] rounded-xl flex items-center justify-center text-[#006B4D] text-xl shrink-0">
                                <FaUsers />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-[#111827]">
                                Tầm nhìn & Sứ mệnh
                            </h2>
                        </div>
                        <p className="text-[#6B7280] mb-4 leading-relaxed text-base">
                            Được thành lập từ những năm đầu 2000, <strong className="text-[#111827] font-bold">In Quang Phát</strong> khởi đầu là một xưởng in nhỏ với khát khao mang lại những sản phẩm bao bì "Made in Vietnam" chất lượng quốc tế.
                        </p>
                        <p className="text-[#6B7280] mb-6 leading-relaxed text-base">
                            Chúng tôi không chỉ in lên giấy, chúng tôi in lên đó <strong className="text-[#111827] font-bold">uy tín thương hiệu</strong> của khách hàng. Sứ mệnh của chúng tôi là nâng tầm giá trị sản phẩm Việt thông qua bao bì chuyên nghiệp, thông qua những chiếc áo được khoác lên người mặc.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 bg-[#F9FAFB] p-3 rounded-xl border border-gray-100">
                                <FaCheckCircle className="text-[#006B4D] text-lg shrink-0" />
                                <span className="font-semibold text-[#111827]">Công nghệ in Offset 4 màu hiện đại.</span>
                            </div>
                            <div className="flex items-center gap-3 bg-[#F9FAFB] p-3 rounded-xl border border-gray-100">
                                <FaCheckCircle className="text-[#006B4D] text-lg shrink-0" />
                                <span className="font-semibold text-[#111827]">Quy trình khép kín: Thiết kế - In - Gia công.</span>
                            </div>
                            <div className="flex items-center gap-3 bg-[#F9FAFB] p-3 rounded-xl border border-gray-100">
                                <FaCheckCircle className="text-[#006B4D] text-lg shrink-0" />
                                <span className="font-semibold text-[#111827]">Cam kết tiến độ & Chất lượng tuyệt đối.</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full">
                        <img
                            src="https://via.placeholder.com/600x400"
                            alt="Team Quang Phat"
                            className="rounded-2xl border border-gray-100 w-full object-cover shadow-sm bg-gray-50"
                        />
                    </div>
                </div>
            </div>

            {/* 3. LỊCH SỬ HÌNH THÀNH (TIMELINE) - Tối giản */}
            <div className="py-8 pb-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex justify-center mb-12">
                        <h2 className="text-2xl font-extrabold text-[#111827] flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
                            <FaHistory className="text-[#006B4D]" /> Chặng đường phát triển
                        </h2>
                    </div>

                    <div className="relative border-l-2 border-gray-200 ml-4 md:ml-1/2 space-y-10">

                        {/* Mốc 1: 2012 */}
                        <div className="relative flex flex-col md:flex-row items-center">
                            <div className="absolute -left-[9px] md:left-1/2 md:-ml-[9px] w-4 h-4 bg-[#006B4D] rounded-full ring-4 ring-[#F9FAFB] border border-[#006B4D]/20"></div>
                            <div className="ml-8 md:ml-0 md:w-1/2 md:pr-12 text-left md:text-right w-full">
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm inline-block w-full">
                                    <span className="inline-block px-2.5 py-1 rounded bg-[#E6F0ED] text-[#006B4D] font-bold text-[10px] uppercase tracking-widest mb-2">2012</span>
                                    <h4 className="font-extrabold text-[#111827] text-lg mb-1">Thành lập Xưởng</h4>
                                    <p className="text-[#6B7280] text-sm leading-relaxed">Khởi đầu với 02 máy in Offset 1 màu và đội ngũ 5 nhân sự tâm huyết tại Hà Nội.</p>
                                </div>
                            </div>
                            <div className="hidden md:block md:w-1/2"></div>
                        </div>

                        {/* Mốc 2: 2015 */}
                        <div className="relative flex flex-col md:flex-row items-center">
                            <div className="absolute -left-[9px] md:left-1/2 md:-ml-[9px] w-4 h-4 bg-[#006B4D] rounded-full ring-4 ring-[#F9FAFB] border border-[#006B4D]/20"></div>
                            <div className="hidden md:block md:w-1/2"></div>
                            <div className="ml-8 md:ml-0 md:w-1/2 md:pl-12 text-left w-full">
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm inline-block w-full">
                                    <span className="inline-block px-2.5 py-1 rounded bg-[#E6F0ED] text-[#006B4D] font-bold text-[10px] uppercase tracking-widest mb-2">2015</span>
                                    <h4 className="font-extrabold text-[#111827] text-lg mb-1">Mở rộng quy mô</h4>
                                    <p className="text-[#6B7280] text-sm leading-relaxed">Chuyển sang nhà xưởng 500m2, đầu tư hệ thống máy in Komori 4 màu Nhật Bản.</p>
                                </div>
                            </div>
                        </div>

                        {/* Mốc 3: 2019 */}
                        <div className="relative flex flex-col md:flex-row items-center">
                            <div className="absolute -left-[9px] md:left-1/2 md:-ml-[9px] w-4 h-4 bg-[#006B4D] rounded-full ring-4 ring-[#F9FAFB] border border-[#006B4D]/20"></div>
                            <div className="ml-8 md:ml-0 md:w-1/2 md:pr-12 text-left md:text-right w-full">
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm inline-block w-full">
                                    <span className="inline-block px-2.5 py-1 rounded bg-[#E6F0ED] text-[#006B4D] font-bold text-[10px] uppercase tracking-widest mb-2">2019</span>
                                    <h4 className="font-extrabold text-[#111827] text-lg mb-1">Mốc 1000 Khách hàng</h4>
                                    <p className="text-[#6B7280] text-sm leading-relaxed">Trở thành đối tác tin cậy của nhiều thương hiệu lớn trong lĩnh vực Bao bì & May mặc.</p>
                                </div>
                            </div>
                            <div className="hidden md:block md:w-1/2"></div>
                        </div>

                        {/* Mốc 4: 2024 - Nay */}
                        <div className="relative flex flex-col md:flex-row items-center">
                            <div className="absolute -left-[9px] md:left-1/2 md:-ml-[9px] w-4 h-4 bg-[#006B4D] rounded-full ring-4 ring-[#F9FAFB] border border-[#006B4D]/20"></div>
                            <div className="hidden md:block md:w-1/2"></div>
                            <div className="ml-8 md:ml-0 md:w-1/2 md:pl-12 text-left w-full">
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm inline-block w-full">
                                    <span className="inline-block px-2.5 py-1 rounded bg-[#E6F0ED] text-[#006B4D] font-bold text-[10px] uppercase tracking-widest mb-2">2024 - NAY</span>
                                    <h4 className="font-extrabold text-[#111827] text-lg mb-1">Nâng tầm năng lực</h4>
                                    <p className="text-[#6B7280] text-sm leading-relaxed">Chuyển đến nhà xưởng mới 2000m2 với máy móc hiện đại, hướng đến chuẩn mực quốc tế.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
};

export default AboutScreen;