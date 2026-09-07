export const COURSE_TYPES = {
  MANDATORY: 'mandatory',
  RESTRICTED_ELECTIVE: 'restricted_elective',
  ELECTIVE: 'elective',
  ITB: 'itb',
  GENERAL: 'general'
};

export const COURSE_TYPE_LABELS = {
  [COURSE_TYPES.MANDATORY]: 'Zorunlu',
  [COURSE_TYPES.RESTRICTED_ELECTIVE]: 'Sınırlı Seçmeli (MT)',
  [COURSE_TYPES.ELECTIVE]: 'Seçmeli (MT)',
  [COURSE_TYPES.ITB]: 'İTB Seçmeli',
  [COURSE_TYPES.GENERAL]: 'Genel'
};

// Basit token parser
export function parseRuleString(str) {
  if (!str || str === '-') return null;
  
  if (!/([A-Z]{3,4}\s\d+[A-Z]?)/.test(str)) {
    const match = str.match(/(\d+)(,\d+)?$/);
    if (match) return { type: 'CREDIT', value: parseInt(match[1]) };
  }
  
  if (/^\d+(,\d+)?$/.test(str)) return { type: 'CREDIT', value: parseInt(str) };
  return { type: 'RAW', value: str };
}

export const courses = [
  { id: 'MAT_103E', code: 'MAT 103E', name: 'Mathematics I', semester: 1, credit: 4, ects: 6.0, type: COURSE_TYPES.MANDATORY, department: 'MAT', rawPrereq: '' },
  { id: 'VBA_111E', code: 'VBA 111E', name: 'Introduction to Data Science and Analytics', semester: 1, credit: 2, ects: 4.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: '' },
  { id: 'VBA_113E', code: 'VBA 113E', name: 'Foundations of Algorithm and Programming', semester: 1, credit: 3, ects: 6.5, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: '' },
  { id: 'VBA_115E', code: 'VBA 115E', name: 'Fundamentals of Linux', semester: 1, credit: 3, ects: 5.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: '' },
  { id: 'VBA_210E', code: 'VBA 210E', name: 'Linear Algebra and Applications', semester: 1, credit: 3, ects: 4.5, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: '' },
  { id: 'ING_100', code: 'ING 100', name: 'EAP Through Global Goals', semester: 1, credit: 3, ects: 3.5, type: COURSE_TYPES.MANDATORY, department: 'ING', rawPrereq: '' },
  { id: 'MAT_104E', code: 'MAT 104E', name: 'Mathematics II', semester: 2, credit: 4, ects: 6.5, type: COURSE_TYPES.MANDATORY, department: 'MAT', rawPrereq: '' },
  { id: 'VBA_122E', code: 'VBA 122E', name: 'Discrete Mathematics', semester: 2, credit: 3, ects: 5.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: '' },
  { id: 'VBA_124E', code: 'VBA 124E', name: 'Object Oriented Programming', semester: 2, credit: 3, ects: 7.5, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Nesneye Yönelik Programlama / Object Oriented Programming(VBA 113EMIN. DDVeyaVBA 113MIN. DD)' },
  { id: 'VBA_252E', code: 'VBA 252E', name: 'Theory of Probability', semester: 2, credit: 3, ects: 7.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Olasılık Teorisi / Theory of Probability(MAT 103MIN. DDVeyaMAT 103EMIN. DD)' },
  { id: 'DAN_102', code: 'DAN 102', name: 'Girişimcilik & Kariyer Danış.', semester: 2, credit: 0, ects: 1.0, type: COURSE_TYPES.MANDATORY, department: 'DAN', rawPrereq: '' },
  { id: 'ING_112A', code: 'ING 112A', name: 'Basics of Academic Writing', semester: 2, credit: 2, ects: 3.5, type: COURSE_TYPES.MANDATORY, department: 'ING', rawPrereq: 'ING 111A' },
  { id: 'VBA_211E', code: 'VBA 211E', name: 'Deterministic Models in Data Science', semester: 3, credit: 3, ects: 4.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Veri Biliminde Deterministik Modeller / Deterministic Models in Data Science(MAT 104MIN. DDVeyaMAT 104EMIN. DD)Ve((VBA 210EMIN. DDVeyaVBA 210MIN. DD)Veya(END 210EMIN. DDVeyaEND 210MIN. DD))' },
  { id: 'VBA_213E', code: 'VBA 213E', name: 'Data Visualization', semester: 3, credit: 3, ects: 6.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: '' },
  { id: 'VBA_215E', code: 'VBA 215E', name: 'Database Management Systems', semester: 3, credit: 3, ects: 6.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Veri Tabanı Yönetim Sistemleri / Database Management Systems(VBA 113EMIN. DDVeyaVBA 113MIN. DD)Veya(BIL 100MIN. DDVeyaBIL 100EMIN. DD)' },
  { id: 'VBA_311E', code: 'VBA 311E', name: 'Statistics', semester: 3, credit: 3, ects: 6.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'İstatistik / Statistics(VBA 252EMIN. DDVeyaVBA 252MIN. DD)Veya(END 252MIN. DDVeyaEND 252EMIN. DD)' },
  { id: 'TUR_121', code: 'TUR 121', name: 'Türk Dili I', semester: 3, credit: 0, ects: 2.0, type: COURSE_TYPES.MANDATORY, department: 'TUR', rawPrereq: '' },
  { id: 'ATA_121', code: 'ATA 121', name: 'Atatürk İlk & İnkılap Trh I', semester: 3, credit: 0, ects: 2.0, type: COURSE_TYPES.MANDATORY, department: 'ATA', rawPrereq: '' },
  { id: 'VBA_222E', code: 'VBA 222E', name: 'Data Structures and Algorithms', semester: 4, credit: 3, ects: 6.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Veri Yapıları ve Algoritmalar / Data Structures and Algorithms(VBA 113EMIN. DDVeyaVBA 113MIN. DD)' },
  { id: 'VBA_224E', code: 'VBA 224E', name: 'Stochastic Models in Data Science', semester: 4, credit: 3, ects: 6.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Veri Biliminde Stokastik Modeller / Stochastic Models in Data Science(VBA 252EMIN. DDVeyaVBA 252MIN. DD)' },
  { id: 'VBA_312E', code: 'VBA 312E', name: 'Data Analytics', semester: 4, credit: 3, ects: 6.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Veri Analitiği / Data Analytics((VBA 113EMIN. DDVeyaVBA 113MIN. DD)Veya(BIL 100MIN. DDVeyaBIL 100EMIN. DD))Ve((VBA 311EMIN. DDVeyaVBA 311MIN. DD)Veya(END 311MIN. DDVeyaEND 311EMIN. DD))' },
  { id: 'TUR_122', code: 'TUR 122', name: 'Türk Dili II', semester: 4, credit: 0, ects: 2.0, type: COURSE_TYPES.MANDATORY, department: 'TUR', rawPrereq: '' },
  { id: 'ATA_122', code: 'ATA 122', name: 'Atatürk İlk & İnkılap Trh II', semester: 4, credit: 0, ects: 2.0, type: COURSE_TYPES.MANDATORY, department: 'ATA', rawPrereq: '' },
  { id: 'VBA_313E', code: 'VBA 313E', name: 'Deep Learning', semester: 5, credit: 3, ects: 8.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Derin Öğrenme / Deep LearningVBA 312EMIN. DDVeya(END 305MIN. DDVeyaEND 305EMIN. DD)' },
  { id: 'VBA_315E', code: 'VBA 315E', name: 'Machine Learning', semester: 5, credit: 3, ects: 7.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Makine Öğrenmesi / Machine LearningVBA 312EMIN. DDVeya(END 305MIN. DDVeyaEND 305EMIN. DD)' },
  { id: 'VBA_317E', code: 'VBA 317E', name: 'Signal and Image Analytics', semester: 5, credit: 3, ects: 5.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Sinyal Ve Görüntü Analitiği / Signal and Image Analytics(MAT 104MIN. DDVeyaMAT 104EMIN. DD)Ve((VBA 210EMIN. DDVeyaVBA 210MIN. DD)Veya(END 210EMIN. DDVeyaEND 210MIN. DD))' },
  { id: 'VBA_319E', code: 'VBA 319E', name: 'Ethics and Law in Data Science', semester: 5, credit: 3, ects: 3.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: '' },
  { id: 'VBA_322E', code: 'VBA 322E', name: 'Computer Vision', semester: 6, credit: 3, ects: 6.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Bilgisayarlı Görü / Computer Vision(VBA 210EMIN. DDVeyaVBA 210MIN. DD)Veya(END 210EMIN. DDVeyaEND 210MIN. DD)' },
  { id: 'VBA_324E', code: 'VBA 324E', name: 'Fundamentals of Natural Language Processing', semester: 6, credit: 3, ects: 6.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Doğal Dil İşlemenin Temelleri / Fundamentals of Natural Language ProcessingVBA 312EMIN. DDVeya(END 305MIN. DDVeyaEND 305EMIN. DD)' },
  { id: 'VBA_326E', code: 'VBA 326E', name: 'Big Data and Analytics', semester: 6, credit: 3, ects: 7.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Büyük Veri ve Analitiği / Big Data and Analytics(VBA 113EMIN. DDVeyaVBA 113MIN. DD)VeyaEND 201EMIN. DD' },
  { id: 'VBA_328E', code: 'VBA 328E', name: 'High Performance Computing', semester: 6, credit: 3, ects: 7.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Yüksek Başarımlı Hesaplama / High Performance Computing((VBA 113EMIN. DDVeyaVBA 113MIN. DD)Veya(BIL 100MIN. DDVeyaBIL 100EMIN. DD))VeVBA 115EMIN. DD' },
  { id: 'VBA_411E', code: 'VBA 411E', name: 'Internet of Things', semester: 7, credit: 3, ects: 6.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Nesnelerin İnterneti / Internet of Things60,00' },
  { id: 'VBA_413E', code: 'VBA 413E', name: 'Cyber Security', semester: 7, credit: 3, ects: 7.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Siber Güvenlik / Cyber Security60,00' },
  { id: 'VBA_4901E', code: 'VBA 4901E', name: 'Graduation Project I', semester: 7, credit: 4, ects: 8.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Bitirme Projesi I / Graduation Project I(MAT 103MIN. DDVeyaMAT 103EMIN. DD)Ve(MAT 104MIN. DDVeyaMAT 104EMIN. DD)Ve((VBA 210EMIN. DDVeyaVBA 210MIN. DD)Veya(END 210EMIN. DDVeyaEND 210MIN. DD))Ve(VBA 313EMIN. DDVeyaVBA 315EMIN. DD)Ve(VBA 211EMIN. DDVeyaVBA 224EMIN. DD)95,00' },
  { id: 'VBA_422E', code: 'VBA 422E', name: 'Cloud Computing', semester: 8, credit: 3, ects: 8.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Bulut Bilişim / Cloud Computing60,00' },
  { id: 'VBA_4902E', code: 'VBA 4902E', name: 'Graduation Project II', semester: 8, credit: 4, ects: 10.0, type: COURSE_TYPES.MANDATORY, department: 'VBA', rawPrereq: 'Bitirme Projesi II / Graduation Project IIVBA 4901EMIN. BB' },
  { id: 'BHB_202E', code: 'BHB 202E', name: 'Introduction to Mathematical Methods in Computational Science and Engineering', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'BHB', rawPrereq: 'Hesaplamalı Bilim ve Mühendislikte Matematiksel  Yöntemlere Giriş / Introduction to Mathematical Methods in Computational  Science and Engineering((EEF 281MIN. DDVeyaEEF 281EMIN. DD)Veya(MAT 143MIN. DDVeyaMAT 143EMIN. DD)VeyaBBF 102EMIN. DDVeya(VBA 210EMIN. DDVeyaVBA 210MIN. DD)Veya(END 210EMIN. DDVeyaEND 210MIN. DD))Ve((MAT 103MIN. DDVeyaMAT 103EMIN. DD)Veya(MAT 185EMIN. DDVeyaMAT 185MIN. DD))' },
  { id: 'BHB_204E', code: 'BHB 204E', name: 'Spatial Data Science', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'BHB', rawPrereq: 'Mekansal Veri Bilimi / Spatial Data Science((EEF 271EMIN. DDVeyaEEF 271MIN. DD)Veya(MAT 244MIN. DDVeyaMAT 244EMIN. DD)Veya(BBF 201EMIN. DDVeyaBBF 201MIN. DD)Veya(MAT 271MIN. DDVeyaMAT 271EMIN. DD)Veya(ISL 213MIN. DDVeyaISL 213EMIN. DD)Veya(END 311MIN. DDVeyaEND 311EMIN. DD)Veya(ECN 211EMIN. DDVeyaECN 211MIN. DD)Veya(VBA 311EMIN. DDVeyaVBA 311MIN. DD)Veya(YZV 231MIN. DDVeyaYZV 231EMIN. DD))Ve((EEF 110EMIN. DDVeyaEEF 110MIN. DD)Veya(MAT 115MIN. DDVeyaMAT 115EMIN. DD)VeyaYZV 104EMIN. DDVeya(BLG 102MIN. DDVeyaBLG 102EMIN. DD)Veya(BIL 100MIN. DDVeyaBIL 100EMIN. DD)Veya(BIL 113MIN. DDVeyaBIL 113EMIN. DD)Veya(VBA 113EMIN. DDVeyaVBA 113MIN. DD))' },
  { id: 'ECN_201E', code: 'ECN 201E', name: 'Intermediate Microeconomics', semester: 0, credit: 3.5, ects: 8.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'ECN', rawPrereq: 'Intermediate Microeconomics / Intermediate Microeconomics(ECN 101MIN. DDVeyaECN 101EMIN. DD)Veya(ISL 233MIN. DDVeyaISL 233EMIN. DD)Veya(ECN 105MIN. DDVeyaECN 105EMIN. DD)Veya(EKO 201MIN. DDVeyaEKO 201EMIN. DD)' },
  { id: 'ECN_202E', code: 'ECN 202E', name: 'Intermediate Macroeconomics', semester: 0, credit: 3.5, ects: 8.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'ECN', rawPrereq: 'Intermediate Macroeconomics / Intermediate Macroeconomics(ECN 102MIN. DDVeyaECN 102EMIN. DD)Veya(ISL 244MIN. DDVeyaISL 244EMIN. DD)Veya(EKO 201MIN. DDVeyaEKO 201EMIN. DD)' },
  { id: 'ECN_302E', code: 'ECN 302E', name: 'Econometrics II', semester: 0, credit: 3.5, ects: 8.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'ECN', rawPrereq: 'Econometrics II / Econometrics IIECN 301EMIN. DDVeya(END 311MIN. DDVeyaEND 311EMIN. DD)Veya(VBA 311EMIN. DDVeyaVBA 311MIN. DD)' },
  { id: 'ECN_307E', code: 'ECN 307E', name: 'Game Theory', semester: 0, credit: 3, ects: 6.0, type: COURSE_TYPES.ITB, department: 'ECN', rawPrereq: 'Game Theory / Game Theory(ECN 201EMIN. DDVeyaECN 201MIN. DD)Veya((EKO 201MIN. DDVeyaEKO 201EMIN. DD)Ve(END 252MIN. DDVeyaEND 252EMIN. DD))Veya((EKO 201MIN. DDVeyaEKO 201EMIN. DD)Ve(VBA 252EMIN. DDVeyaVBA 252MIN. DD))Veya((EKO 201MIN. DDVeyaEKO 201EMIN. DD)Ve(MAT 221MIN. DDVeyaMAT 221EMIN. DD))' },
  { id: 'EKO_201E', code: 'EKO 201E', name: 'Economics', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'EKO', rawPrereq: '' },
  { id: 'END_327E', code: 'END 327E', name: 'Decision Theory', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'END', rawPrereq: 'Karar Teorisi / Decision Theory((END 252MIN. DDVeyaEND 252EMIN. DD)Veya(VBA 252EMIN. DDVeyaVBA 252MIN. DD)Veya(ECN 211EMIN. DDVeyaECN 211MIN. DD)Veya(ECN 209MIN. DDVeyaECN 209EMIN. DD))Ve((END 331MIN. DDVeyaEND 331EMIN. DD)VeyaVBA 211EMIN. DDVeya(ECN 211EMIN. DDVeyaECN 211MIN. DD)Veya(ECN 209MIN. DDVeyaECN 209EMIN. DD))' },
  { id: 'END_365E', code: 'END 365E', name: 'People Analytics', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'END', rawPrereq: 'Büyük Veri Çağında İnsan Analitiği / People Analytics(END 311MIN. DDVeyaEND 311EMIN. DD)' },
  { id: 'END_367E', code: 'END 367E', name: 'Automation in Production Syst.', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'END', rawPrereq: '' },
  { id: 'END_369E', code: 'END 369E', name: 'Game Theory', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'END', rawPrereq: 'Oyun Teorisi / Game Theory((END 252MIN. DDVeyaEND 252EMIN. DD)Veya(VBA 252EMIN. DDVeyaVBA 252MIN. DD))Ve((END 311MIN. DDVeyaEND 311EMIN. DD)VeyaVBA 211EMIN. DD)' },
  { id: 'END_446E', code: 'END 446E', name: 'Statistical Experimental Design', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'END', rawPrereq: 'İstatistiksel Deney Tasarımı / Statistical Experimental Design((END 252MIN. DDVeyaEND 252EMIN. DD)Veya(VBA 252EMIN. DDVeyaVBA 252MIN. DD))Ve((END 311MIN. DDVeyaEND 311EMIN. DD)Veya(VBA 311EMIN. DDVeyaVBA 311MIN. DD))' },
  { id: 'END_447E', code: 'END 447E', name: 'Network Models', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'END', rawPrereq: 'Ağ Modelleri / Network Models(END 331MIN. DDVeyaEND 331EMIN. DD)VeyaVBA 211EMIN. DD' },
  { id: 'END_457E', code: 'END 457E', name: 'Heuristic Optimization', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'END', rawPrereq: 'Sezgisel Optimizasyon / Heuristic Optimization(END 331MIN. DDVeyaEND 331EMIN. DD)VeyaVBA 211EMIN. DD' },
  { id: 'END_458E', code: 'END 458E', name: 'Nonlinear Optimization', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'END', rawPrereq: 'Doğrusal Olmayan Optimizasyon / Nonlinear Optimization((END 331MIN. DDVeyaEND 331EMIN. DD)Veya(ISL 323MIN. DDVeyaISL 323EMIN. DD)VeyaVBA 211EMIN. DD)60,00' },
  { id: 'END_471E', code: 'END 471E', name: 'Marketing & CRM Analytics', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'END', rawPrereq: 'Müşteri İlişkileri Yönetimi ve Pazarlama Analitiği / Marketing & CRM Analytics(END 311MIN. DDVeyaEND 311EMIN. DD)Veya(VBA 311EMIN. DDVeyaVBA 311MIN. DD)' },
  { id: 'END_474E', code: 'END 474E', name: 'Supply Chain Analytics', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'END', rawPrereq: 'Tedarik Zinciri Analitiği / Supply Chain Analytics(END 331MIN. DDVeyaEND 331EMIN. DD)VeyaVBA 211EMIN. DD' },
  { id: 'END_493E', code: 'END 493E', name: 'Applied Statistics', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'END', rawPrereq: 'Uygulamalı İstatistik / Applied Statistics((END 311MIN. DDVeyaEND 311EMIN. DD)Veya(VBA 311EMIN. DDVeyaVBA 311MIN. DD))95,00' },
  { id: 'VBA_341E', code: 'VBA 341E', name: 'Human Resource Analytics', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'VBA', rawPrereq: '' },
  { id: 'VBA_342E', code: 'VBA 342E', name: 'Social Network Analysis', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'VBA', rawPrereq: '' },
  { id: 'VBA_343E', code: 'VBA 343E', name: 'Recommender Systems', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'VBA', rawPrereq: '' },
  { id: 'VBA_344E', code: 'VBA 344E', name: 'Financial and Risk Analytics', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'VBA', rawPrereq: '' },
  { id: 'VBA_441E', code: 'VBA 441E', name: 'Reinforcement Learning', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'VBA', rawPrereq: 'Pekiştirilmiş Öğrenme / Reinforcement LearningVBA 224EMIN. DD' },
  { id: 'VBA_442E', code: 'VBA 442E', name: 'Time Series and Forecasting', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'VBA', rawPrereq: '' },
  { id: 'VBA_443E', code: 'VBA 443E', name: 'Web Analytics', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'VBA', rawPrereq: '' },
  { id: 'VBA_444E', code: 'VBA 444E', name: 'Customer Analytics', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'VBA', rawPrereq: '' },
  { id: 'BHB_401E', code: 'BHB 401E', name: 'Sustainable Data Center Infrastructure', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'BHB', rawPrereq: '' },
  { id: 'BHB_402E', code: 'BHB 402E', name: 'Computational Neuroscience', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'BHB', rawPrereq: 'Hesaplamalı Sinirbilimi / Computational Neuroscience((EEF 110EMIN. DDVeyaEEF 110MIN. DD)Veya(MAT 115MIN. DDVeyaMAT 115EMIN. DD)VeyaYZV 104EMIN. DDVeya(BLG 102MIN. DDVeyaBLG 102EMIN. DD)Veya(BIL 100MIN. DDVeyaBIL 100EMIN. DD)Veya(BIL 113MIN. DDVeyaBIL 113EMIN. DD)Veya(VBA 113EMIN. DDVeyaVBA 113MIN. DD))Ve((EEF 271EMIN. DDVeyaEEF 271MIN. DD)Veya(MAT 244MIN. DDVeyaMAT 244EMIN. DD)Veya(BBF 201EMIN. DDVeyaBBF 201MIN. DD)Veya(MAT 271MIN. DDVeyaMAT 271EMIN. DD)Veya(ISL 213MIN. DDVeyaISL 213EMIN. DD)Veya(END 311MIN. DDVeyaEND 311EMIN. DD)Veya(ECN 211EMIN. DDVeyaECN 211MIN. DD)Veya(VBA 311EMIN. DDVeyaVBA 311MIN. DD)Veya(YZV 231MIN. DDVeyaYZV 231EMIN. DD))' },
  { id: 'ECN_410E', code: 'ECN 410E', name: 'Energy Economics', semester: 0, credit: 3.0, ects: 5.5, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'ECN', rawPrereq: 'Energy Economics / Energy Economics(ECN 201EMIN. DDVeyaECN 201MIN. DD)Veya(END 312MIN. DDVeyaEND 312EMIN. DD)' },
  { id: 'ECN_411E', code: 'ECN 411E', name: 'Transport Economics', semester: 0, credit: 3.0, ects: 5.5, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'ECN', rawPrereq: 'Transport Economics / Transport Economics(ECN 201EMIN. DDVeyaECN 201MIN. DD)' },
  { id: 'ECN_412E', code: 'ECN 412E', name: 'Environmental Economics', semester: 0, credit: 3.0, ects: 5.5, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'ECN', rawPrereq: 'Environmental Economics / Environmental Economics(ECN 201EMIN. DDVeyaECN 201MIN. DD)' },
  { id: 'ECN_413E', code: 'ECN 413E', name: 'Health Economics', semester: 0, credit: 3.0, ects: 5.5, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'ECN', rawPrereq: 'Health Economics / Health Economics(ECN 201EMIN. DDVeyaECN 201MIN. DD)' },
  { id: 'ECN_414E', code: 'ECN 414E', name: 'Economics of Education', semester: 0, credit: 3.0, ects: 5.5, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'ECN', rawPrereq: 'Economics of Education / Economics of Education(ECN 201EMIN. DDVeyaECN 201MIN. DD)' },
  { id: 'ECN_415E', code: 'ECN 415E', name: 'Urban Economics', semester: 0, credit: 3.0, ects: 5.5, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'ECN', rawPrereq: 'Urban Economics / Urban Economics(ECN 201EMIN. DDVeyaECN 201MIN. DD)' },
  { id: 'ECN_420E', code: 'ECN 420E', name: 'Behavioural Economics', semester: 0, credit: 3.0, ects: 5.5, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'ECN', rawPrereq: 'Behavioural Economics / Behavioural Economics(ECN 201EMIN. DDVeyaECN 201MIN. DD)' },
  { id: 'END_312E', code: 'END 312E', name: 'Engineering Economics', semester: 0, credit: 3.0, ects: 6.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'END', rawPrereq: '' },
  { id: 'END_339E', code: 'END 339E', name: 'Project Management', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'END', rawPrereq: '' },
  { id: 'END_375E', code: 'END 375E', name: 'Human-Computer Interaction', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'END', rawPrereq: '' },
  { id: 'ISL_224E', code: 'ISL 224E', name: 'Cost Accounting', semester: 0, credit: 3.0, ects: 6.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'ISL', rawPrereq: '' },
  { id: 'ISL_333E', code: 'ISL 333E', name: 'Finance', semester: 0, credit: 3.0, ects: 6.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'ISL', rawPrereq: '' },
  { id: 'ISL_343E', code: 'ISL 343E', name: 'Management Information Syst.', semester: 0, credit: 3.0, ects: 6.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'ISL', rawPrereq: '' },
  { id: 'ISL_353E', code: 'ISL 353E', name: 'Marketing', semester: 0, credit: 3.0, ects: 5.5, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'ISL', rawPrereq: '' },
  { id: 'ISL_478E', code: 'ISL 478E', name: 'Entrepreneurship', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.RESTRICTED_ELECTIVE, department: 'ISL', rawPrereq: '' },
  { id: 'ALM_101', code: 'ALM 101', name: 'Almanca I', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ALM', rawPrereq: '' },
  { id: 'ALM_102', code: 'ALM 102', name: 'Almanca II', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ALM', rawPrereq: 'ALM 101' },
  { id: 'ALM_201', code: 'ALM 201', name: 'Almanca III', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ALM', rawPrereq: 'ALM 200' },
  { id: 'ALM_202', code: 'ALM 202', name: 'Almanca IV', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ALM', rawPrereq: 'ALM 201' },
  { id: 'ALM_301', code: 'ALM 301', name: 'Almanca V', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ALM', rawPrereq: 'ALM 300' },
  { id: 'ALM_302', code: 'ALM 302', name: 'Almanca VI', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ALM', rawPrereq: 'ALM 301' },
  { id: 'ALM_401', code: 'ALM 401', name: 'Almanca VII', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ALM', rawPrereq: 'ALM 400' },
  { id: 'ARB_101', code: 'ARB 101', name: 'Arapça I', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ARB', rawPrereq: '' },
  { id: 'ARB_102', code: 'ARB 102', name: 'Arapça II', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ARB', rawPrereq: 'ARB 101' },
  { id: 'CIN_101', code: 'CIN 101', name: 'Çince I', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'CIN', rawPrereq: '' },
  { id: 'CIN_102', code: 'CIN 102', name: 'Çince II', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'CIN', rawPrereq: 'CIN 101' },
  { id: 'CIN_201', code: 'CIN 201', name: 'Çince III', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'CIN', rawPrereq: 'CIN 200' },
  { id: 'FRA_101', code: 'FRA 101', name: 'Fransızca I', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'FRA', rawPrereq: '' },
  { id: 'FRA_102', code: 'FRA 102', name: 'Fransızca II', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'FRA', rawPrereq: 'FRA 101' },
  { id: 'FRA_201', code: 'FRA 201', name: 'Fransızca III', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'FRA', rawPrereq: 'FRA 200' },
  { id: 'FRA_202', code: 'FRA 202', name: 'Fransızca IV', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'FRA', rawPrereq: 'FRA 201' },
  { id: 'FRA_301', code: 'FRA 301', name: 'Fransızca V', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'FRA', rawPrereq: 'FRA 300' },
  { id: 'FRA_302', code: 'FRA 302', name: 'Fransızca VI', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'FRA', rawPrereq: 'FRA 301' },
  { id: 'HUK_211', code: 'HUK 211', name: 'Sosyal Güvenlik Hukuku', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'HUK', rawPrereq: '' },
  { id: 'HUK_212', code: 'HUK 212', name: 'Sendika.&Toplu İş Sözl.Hukuku', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'HUK', rawPrereq: '' },
  { id: 'HUK_213', code: 'HUK 213', name: 'İş Sağlığı ve Güvenliği Hukuku', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'HUK', rawPrereq: '' },
  { id: 'HUK_214', code: 'HUK 214', name: 'Teknolojik Yeniliklerin Korun.', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'HUK', rawPrereq: '' },
  { id: 'HUK_215', code: 'HUK 215', name: 'Sözleşmeler Hukuku', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'HUK', rawPrereq: '' },
  { id: 'HUK_216', code: 'HUK 216', name: 'Telekomünikasyon Hukuku', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'HUK', rawPrereq: '' },
  { id: 'HUK_217', code: 'HUK 217', name: 'AR-GE Hukuku', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'HUK', rawPrereq: '' },
  { id: 'HUK_218', code: 'HUK 218', name: 'Ticaret Hukuku', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'HUK', rawPrereq: '' },
  { id: 'ING_103A', code: 'ING 103A', name: 'Creative Writing', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ING', rawPrereq: 'ING 102A' },
  { id: 'ING_103AC', code: 'ING 103AC', name: 'Urban Ecology', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ING', rawPrereq: 'ING 102AC' },
  { id: 'ING_103AD', code: 'ING 103AD', name: 'Advanced English for Engineers', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ING', rawPrereq: 'ING 102AD' },
  { id: 'ING_103B', code: 'ING 103B', name: 'Business English', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ING', rawPrereq: 'ING 102B' },
  { id: 'ING_103C', code: 'ING 103C', name: 'Great Moments in Science', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ING', rawPrereq: 'ING 102C' },
  { id: 'ING_103CO', code: 'ING 103CO', name: 'Profess.Communic.for Engineers', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ING', rawPrereq: 'ING 102CO' },
  { id: 'ING_103DD', code: 'ING 103DD', name: 'Decoding Discourse: Language, Power, and Ideology', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ING', rawPrereq: 'ING 102DD' },
  { id: 'ING_103G', code: 'ING 103G', name: 'Business Communications', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ING', rawPrereq: 'ING 102G' },
  { id: 'ING_103H', code: 'ING 103H', name: 'Public Presentations', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ING', rawPrereq: 'ING 102H' },
  { id: 'ING_103I', code: 'ING 103I', name: 'Short Stories', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ING', rawPrereq: 'ING 102I' },
  { id: 'ING_103L', code: 'ING 103L', name: 'Mythology', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ING', rawPrereq: 'ING 102L' },
  { id: 'ING_103N', code: 'ING 103N', name: 'Film Studies', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ING', rawPrereq: 'ING 102N' },
  { id: 'ING_103O', code: 'ING 103O', name: 'Psychology', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ING', rawPrereq: 'ING 102O' },
  { id: 'ING_103P', code: 'ING 103P', name: 'Poetry', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ING', rawPrereq: 'ING 102P' },
  { id: 'ING_103ES', code: 'ING 103ES', name: 'Intercultural Citizenship in International Education', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ING', rawPrereq: 'ING 102ES' },
  { id: 'ING_103SC', code: 'ING 103SC', name: 'Science Communication', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ING', rawPrereq: 'ING 102SC' },
  { id: 'ISL_465E', code: 'ISL 465E', name: 'Int.to Entrepreneurship&Innov.', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ISL', rawPrereq: '' },
  { id: 'ISP_101', code: 'ISP 101', name: 'İspanyolca I', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ISP', rawPrereq: '' },
  { id: 'ISP_102', code: 'ISP 102', name: 'İspanyolca II', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ISP', rawPrereq: 'ISP 101' },
  { id: 'ISP_201', code: 'ISP 201', name: 'İspanyolca III', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ISP', rawPrereq: 'ISP 200' },
  { id: 'ISP_202', code: 'ISP 202', name: 'İspanyolca IV', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ISP', rawPrereq: 'ISP 201' },
  { id: 'ISP_301', code: 'ISP 301', name: 'İspanyolca V', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ISP', rawPrereq: 'ISP 300' },
  { id: 'ISP_302', code: 'ISP 302', name: 'İspanyolca VI', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ISP', rawPrereq: 'ISP 301' },
  { id: 'ITA_101', code: 'ITA 101', name: 'İtalyanca I', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ITA', rawPrereq: '' },
  { id: 'ITA_102', code: 'ITA 102', name: 'İtalyanca II', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ITA', rawPrereq: 'ITA 101' },
  { id: 'ITA_201', code: 'ITA 201', name: 'İtalyanca III', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ITA', rawPrereq: 'ITA 200' },
  { id: 'ITA_202', code: 'ITA 202', name: 'İtalyanca IV', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ITA', rawPrereq: 'ITA 201' },
  { id: 'ITA_301', code: 'ITA 301', name: 'İtalyanca V', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'ITA', rawPrereq: 'ITA 300' },
  { id: 'JPN_101', code: 'JPN 101', name: 'Japonca I', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'JPN', rawPrereq: '' },
  { id: 'JPN_102', code: 'JPN 102', name: 'Japonca II', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'JPN', rawPrereq: 'JPN 101' },
  { id: 'JPN_201', code: 'JPN 201', name: 'Japonca III', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'JPN', rawPrereq: 'JPN 200' },
  { id: 'JPN_202', code: 'JPN 202', name: 'Japonca IV', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'JPN', rawPrereq: 'JPN 201' },
  { id: 'RUS_101', code: 'RUS 101', name: 'Rusça I', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'RUS', rawPrereq: '' },
  { id: 'RUS_102', code: 'RUS 102', name: 'Rusça II', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'RUS', rawPrereq: 'RUS 101' },
  { id: 'RUS_201', code: 'RUS 201', name: 'Rusça III', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'RUS', rawPrereq: 'RUS 200' },
  { id: 'RUS_202', code: 'RUS 202', name: 'Rusça IV', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'RUS', rawPrereq: 'RUS 201' },
  { id: 'SNT_102E', code: 'SNT 102E', name: 'Photography', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_103E', code: 'SNT 103E', name: 'Drawing', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_104E', code: 'SNT 104E', name: 'Mythology and Art', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_105E', code: 'SNT 105E', name: 'Film Art', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_106E', code: 'SNT 106E', name: 'Traditional Turkish Art&Crafts', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_107E', code: 'SNT 107E', name: 'Ancient Civilizat.in Anatolia', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_112E', code: 'SNT 112E', name: 'Theater', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_113E', code: 'SNT 113E', name: 'Art and Interpretation', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_114E', code: 'SNT 114E', name: 'Contemporary Art', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_116E', code: 'SNT 116E', name: 'The Art of Communication', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_117E', code: 'SNT 117E', name: 'Jazz Appreciation', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_121E', code: 'SNT 121E', name: 'World Music Cultures', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_123E', code: 'SNT 123E', name: 'Film Production', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_211E', code: 'SNT 211E', name: 'Istanbul:Hist.,Art and Society', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_212E', code: 'SNT 212E', name: 'Art,Culture and Society', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_215E', code: 'SNT 215E', name: 'Balkan Musics', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_226E', code: 'SNT 226E', name: 'Philosophy of Art', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_227E', code: 'SNT 227E', name: 'Sound and Society', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_101', code: 'SNT 101', name: 'Heykel Sanatına Bakış', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_102', code: 'SNT 102', name: 'Fotoğraf', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_103', code: 'SNT 103', name: 'Desen', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_104', code: 'SNT 104', name: 'Mitoloji ve Sanat', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_105', code: 'SNT 105', name: 'Sinema Sanatı', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_106', code: 'SNT 106', name: 'Geleneks. Türk El Sanatları', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_107', code: 'SNT 107', name: 'İlkçağ Anadolu Uygarlıkları', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_108', code: 'SNT 108', name: 'Seramik', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_109', code: 'SNT 109', name: 'Kazı Resim (Gravür)', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_111', code: 'SNT 111', name: 'Moda Tasarımı ve Sanat', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_112', code: 'SNT 112', name: 'Tiyatro', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_114', code: 'SNT 114', name: 'Günümüz Sanatı', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_115', code: 'SNT 115', name: 'Modernite ve Görsel Kültür', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_116', code: 'SNT 116', name: 'İletişim Sanatı', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_123', code: 'SNT 123', name: 'Film Yapımı', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_211', code: 'SNT 211', name: 'İstanbul:Tarih,Sanat ve Toplum', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_212', code: 'SNT 212', name: 'Sanat,Kültür ve Toplum', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_214', code: 'SNT 214', name: 'Performans, Müzik ve Dans', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_228', code: 'SNT 228', name: 'Müzik ve Politika', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
  { id: 'SNT_229', code: 'SNT 229', name: 'Türkiye\'de Popüler Müzik Tarihinden İzlekler', semester: 0, credit: 3.0, ects: 4.0, type: COURSE_TYPES.ITB, department: 'SNT', rawPrereq: '' },
];

export const courseMap = new Map(courses.map(c => [c.id, c]));

export function arePrerequisitesMet(courseId, passedCourses) {
  const course = courseMap.get(courseId);
  if (!course) return false;
  if (!course.rawPrereq) return true;

  const rule = parseRuleString(course.rawPrereq);
  if (!rule) return true;
  
  if (rule.type === 'CREDIT') {
    let totalCredits = 0;
    for (const pid of passedCourses) {
      const pc = courseMap.get(pid);
      if (pc) totalCredits += pc.credit;
    }
    return totalCredits >= rule.value;
  }
  
  if (rule.type === 'RAW') {
    let evalStr = rule.value;
    const match = evalStr.match(/(\([^)]*\)|[A-Z]{3,4}\s\d+[A-Z]?)/);
    if (match) evalStr = evalStr.substring(match.index);
    
    // Strip trailing credits like )60,00 -> )
    evalStr = evalStr.replace(/\)\s*\d+(,\d+)?$/, ')');

    const courseMatchRegex = /(?:([A-Z]{3,4}\s\d+[A-Z]?)(MIN\.\s*[A-Z]{2}))|([A-Z]{3,4}\s\d+[A-Z]?)/g;
    
    evalStr = evalStr.replace(courseMatchRegex, (match, code1, minStr, code2) => {
       let code = (code1 || code2).trim();
       const id = code.replace(' ', '_');
       let isPassed = passedCourses.includes(id);
       
       if (!isPassed) {
         if (code.endsWith('E')) {
           isPassed = passedCourses.includes(id.substring(0, id.length - 1));
         } else {
           isPassed = passedCourses.includes(id + 'E');
         }
       }
       return isPassed ? " true " : " false ";
    });
    
    evalStr = evalStr.replace(/Veya/g, ' || ').replace(/Ve/g, ' && ');
    
    try {
       return (new Function('return ' + evalStr))();
    } catch (e) {
       console.error("Parse error for rule:", rule.value, e);
       return false;
    }
  }

  return true;
}

export function getAvailableCourses(passedCourses) {
  return courses.filter(c => {
    if (passedCourses.includes(c.id)) return false;
    return arePrerequisitesMet(c.id, passedCourses);
  });
}
