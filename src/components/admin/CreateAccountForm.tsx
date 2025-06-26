import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Calendar,
  Phone,
  UserRound,
  IdCard,
  MapPin,
} from 'lucide-react';
import { createUser } from '../../services/api/account';
import NotificationBar from '../common/NotificationBar';

interface CreateAccountFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  dateOfBirth: '',
  phone: '',
  gender: 'true',
  idNumber: '',
  issueDate: '',
  expiryDate: '',
  placeOfIssue: '',
  placeOfBirth: '',
  address: '',
};

const steps = [
  {
    label: 'Thông tin cá nhân',
    fields: [
      { name: 'fullName', placeholder: 'Họ tên', type: 'text', required: true },
      { name: 'email', placeholder: 'Email', type: 'email', required: true },
      { name: 'password', placeholder: 'Mật khẩu', type: 'password', required: true },
      { name: 'dateOfBirth', placeholder: 'Ngày sinh (DD/MM/YYYY)', type: 'text', required: true }, 
      { name: 'phone', placeholder: 'Số điện thoại', type: 'text', required: true },
      { name: 'gender', placeholder: 'Giới tính', type: 'select', required: true },
    ],
  },
  {
    label: 'Thông tin giấy tờ',
    fields: [
      { name: 'idNumber', placeholder: 'Số CMND/CCCD', type: 'text', required: true },
      { name: 'issueDate', placeholder: 'Ngày cấp (DD/MM/YYYY)', type: 'text', required: true },
      { name: 'expiryDate', placeholder: 'Ngày hết hạn (DD/MM/YYYY)', type: 'text', required: true },
      { name: 'placeOfIssue', placeholder: 'Nơi cấp', type: 'text', required: true },
    ],
  },
  {
    label: 'Địa chỉ',
    fields: [
      { name: 'placeOfBirth', placeholder: 'Nơi sinh', type: 'text', required: true },
      { name: 'address', placeholder: 'Địa chỉ', type: 'text', required: true },
    ],
  },
];

const iconMap: { [key: string]: React.ReactNode } = {
  fullName: <User className="text-gray-400 w-5 h-5" />,
  email: <Mail className="text-gray-400 w-5 h-5" />,
  password: <Lock className="text-gray-400 w-5 h-5" />,
  dateOfBirth: <Calendar className="text-gray-400 w-5 h-5" />,
  phone: <Phone className="text-gray-400 w-5 h-5" />,
  gender: <UserRound className="text-gray-400 w-5 h-5" />,
  idNumber: <IdCard className="text-gray-400 w-5 h-5" />,
  issueDate: <Calendar className="text-gray-400 w-5 h-5" />,
  expiryDate: <Calendar className="text-gray-400 w-5 h-5" />,
  placeOfIssue: <MapPin className="text-gray-400 w-5 h-5" />,
  placeOfBirth: <MapPin className="text-gray-400 w-5 h-5" />,
  address: <MapPin className="text-gray-400 w-5 h-5" />,
};

function toDisplayDate(isoDate: string) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

function toISODate(displayDate: string) {
  const [d, m, y] = displayDate.split('/');
  if (!d || !m || !y) return displayDate;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
  return /^[0-9]{9,15}$/.test(phone);
}

function isValidIdNumber(id: string) {
  return /^[0-9]{9,12}$/.test(id);
}

function isValidDateVN(date: string) {
  // DD/MM/YYYY
  if (!/^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{4}$/.test(date)) return false;
  // Check if date is valid
  const [d, m, y] = date.split('/').map(Number);
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y &&
    dt.getMonth() === m - 1 &&
    dt.getDate() === d
  );
}

const CreateAccountForm: React.FC<CreateAccountFormProps> = ({ visible, onClose, onSuccess }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [creating, setCreating] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  if (!visible) return null;

  const handleChange = (name: string, value: string) => {
    setForm(f => {
      if (['dateOfBirth', 'issueDate', 'expiryDate'].includes(name)) {
        return { ...f, [name]: toISODate(value) };
      }
      return { ...f, [name]: name === 'gender' ? value : value };
    });
    setErrors(e => ({ ...e, [name]: '' }));
  };

  const validateStep = () => {
    const currentFields = steps[step].fields;
    const newErrors: { [key: string]: string } = {};
    for (const field of currentFields) {
      const value = form[field.name as keyof typeof form] as string;

      // Bắt buộc
      if (field.required && !value) {
        newErrors[field.name] = `${field.placeholder} là bắt buộc`;
        continue;
      }

      // Họ tên, Nơi sinh, Nơi cấp, Địa chỉ
      if (
        ['fullName', 'placeOfBirth', 'placeOfIssue', 'address'].includes(field.name) &&
        value &&
        value.length < 2
      ) {
        newErrors[field.name] = `${field.placeholder} phải có ít nhất 2 ký tự`;
      }

      // Email
      if (field.name === 'email' && value && !isValidEmail(value)) {
        newErrors[field.name] = 'Email không hợp lệ';
      }

      // Mật khẩu
      if (field.name === 'password' && value && value.length < 6) {
        newErrors[field.name] = 'Mật khẩu phải có ít nhất 6 ký tự';
      }

      // Số điện thoại
      if (field.name === 'phone' && value && !isValidPhone(value)) {
        newErrors[field.name] = 'Số điện thoại phải là số và có từ 9 đến 15 chữ số';
      }

      // Số CMND/CCCD
      if (field.name === 'idNumber' && value && !isValidIdNumber(value)) {
        newErrors[field.name] = 'Số CMND/CCCD phải là số và có từ 9 đến 12 chữ số';
      }

      // Ngày (DD/MM/YYYY)
      if (
        ['dateOfBirth', 'issueDate', 'expiryDate'].includes(field.name) &&
        value &&
        !isValidDateVN(toDisplayDate(value))
      ) {
        newErrors[field.name] = 'Định dạng ngày phải là DD/MM/YYYY và hợp lệ';
      }

      // Giới tính
      if (field.name === 'gender' && value !== 'true' && value !== 'false') {
        newErrors[field.name] = 'Vui lòng chọn giới tính';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) {
      
      return;
    }
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setCreating(true);
    try {
      const formData = new FormData();
      Object.entries({ ...form }).forEach(([key, value]) => {
        formData.append(key, value);
      });
      await createUser(formData);
      setForm(initialForm);
      setStep(0);
      setNotification({
        show: true,
        message: "Tạo tài khoản thành công!",
        type: "success",
      });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err.response && err.response.data) {
        const apiErrors = err.response.data;
        const formattedErrors: { [key: string]: string } = {};
        Object.keys(apiErrors).forEach(key => {
          formattedErrors[key] = Array.isArray(apiErrors[key])
            ? apiErrors[key].join('. ')
            : apiErrors[key];
        });
        setErrors(formattedErrors);
        setNotification({
          show: true,
          message: "Tạo tài khoản thất bại!",
          type: "error",
        });
      } else {
        setNotification({
          show: true,
          message: "Tạo tài khoản thất bại!",
          type: "error",
        });
      }
    }
    setCreating(false);
  };

  const currentFields = steps[step].fields;

  return (
    <>
      <NotificationBar
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(n => ({ ...n, show: false }))}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="relative w-full max-w-2xl rounded-3xl p-14 shadow-2xl bg-white border border-blue-100 transition-all duration-300">
          <button
            className="absolute top-3 right-4 text-gray-400 text-3xl font-bold hover:text-blue-600 transition"
            onClick={() => {
              setForm(initialForm);
              setStep(0);
              onClose();
            }}
          >
            ×
          </button>
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-3xl font-extrabold text-blue-700 mb-2 tracking-tight">Tạo tài khoản</h2>
            <div className="w-full flex justify-between items-end mb-4">
              {steps.map((s, idx) => (
                <div key={s.label} className="flex flex-col items-center flex-1">
                  <span
                    className={`w-9 h-9 flex items-center justify-center rounded-full border-2 text-lg font-bold mb-1
                      ${idx === step
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'}
                      transition`}
                  >
                    {idx + 1}
                  </span>
                  <span className={`text-sm ${idx === step ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
              <div
                className="h-2 bg-blue-500 rounded-full transition-all"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">{steps[step].label}</h3>
          </div>
          <form onSubmit={handleNext} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentFields.map((field, idx) => {
                // For last field in odd-length step, span two columns
                const isLastOdd =
                  currentFields.length % 2 === 1 && idx === currentFields.length - 1;
                return field.type === 'select' ? (
                  <div
                    key={field.name}
                    className={`relative ${isLastOdd ? 'md:col-span-2' : ''}`}
                  >
                    <div className="flex items-center border rounded-lg p-2 bg-white focus-within:ring-2 focus-within:ring-blue-300">
                      <span className="mr-2">{iconMap[field.name]}</span>
                      <select
                        className="w-full bg-transparent outline-none"
                        value={form.gender}
                        onChange={e => handleChange('gender', e.target.value)}
                        name="gender"
                      >
                        <option value="true">Nam</option>
                        <option value="false">Nữ</option>
                      </select>
                    </div>
                    {errors.gender && (
                      <div className="text-red-500 text-xs ml-2">{errors.gender}</div>
                    )}
                  </div>
                ) : (
                  <div
                    key={field.name}
                    className={`relative ${isLastOdd ? 'md:col-span-2' : ''}`}
                  >
                    <div className="flex items-center border rounded-lg p-2 bg-white focus-within:ring-2 focus-within:ring-blue-300">
                      <span className="mr-2">{iconMap[field.name]}</span>
                      <input
                        className="w-full bg-transparent outline-none"
                        placeholder={field.placeholder}
                        type={field.type}
                        name={field.name}
                        value={
                          ['dateOfBirth', 'issueDate', 'expiryDate'].includes(field.name)
                            ? toDisplayDate(form[field.name as keyof typeof form] as string)
                            : (form[field.name as keyof typeof form] as string)
                        }
                        onChange={e => handleChange(field.name, e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    {errors[field.name] && (
                      <div className="text-red-500 text-xs ml-2">{errors[field.name]}</div>
                    )}
                    {field.name === 'password' && (
                      <div className="text-xs text-gray-400 ml-2 mt-1">
                        Mật khẩu tối thiểu 6 ký tự
                      </div>
                    )}
                    {field.name.toLowerCase().includes('date') && (
                      <div className="text-xs text-gray-400 ml-2 mt-1">
                        Định dạng: DD/MM/YYYY
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-6">
              {step > 0 && (
                <button
                  type="button"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg shadow transition"
                  onClick={() => setStep(step - 1)}
                  disabled={creating}
                >
                  Quay lại
                </button>
              )}
              <button
                type="submit"
                onClick={() => console.log('Submit button clicked')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow font-semibold transition"
                disabled={creating}
              >
                {step === steps.length - 1
                  ? creating
                    ? 'Đang tạo...'
                    : 'Tạo tài khoản'
                  : 'Tiếp theo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateAccountForm;
