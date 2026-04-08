import React, { useState, useEffect, useMemo } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  OperationType, 
  handleFirestoreError,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from './firebase';
import { 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  getDocs,
  doc,
  setDoc
} from 'firebase/firestore';
import { format, isWithinInterval, set, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, Calendar, Clock, User as UserIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import SeatMap, { TOTAL_TABLES } from './components/SeatMap';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<any[]>([]);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = addDays(new Date(), 1);
  const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
  const isWeekend = tomorrow.getDay() === 0 || tomorrow.getDay() === 6;

  // Auth listener
  useEffect(() => {
    // Check for redirect result on mount
    getRedirectResult(auth).catch((e) => {
      console.error('Redirect result error:', e);
      if (e.code === 'auth/internal-error' || e.message.includes('missing initial state')) {
        setError('로그인 상태를 초기화하는 중 오류가 발생했습니다. 브라우저 설정을 확인하거나 다시 시도해 주세요.');
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Sync user profile
        try {
          await setDoc(doc(db, 'users', u.uid), {
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            photoURL: u.photoURL,
            role: 'student'
          }, { merge: true });
        } catch (e) {
          console.error('Error syncing user:', e);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Reservations listener
  useEffect(() => {
    const q = query(collection(db, 'reservations'), where('date', '==', tomorrowStr));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const res = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservations(res);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reservations');
    });
    return unsubscribe;
  }, [tomorrowStr]);

  const handleLogin = async () => {
    setError(null);
    try {
      // Use redirect for mobile/tablet, popup for desktop
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (e: any) {
      console.error('Login error:', e);
      if (e.code === 'auth/popup-blocked') {
        setError('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해 주세요.');
      } else {
        setError('로그인에 실패했습니다. 다시 시도해 주세요.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const myReservation = useMemo(() => {
    return reservations.find(r => r.userId === user?.uid);
  }, [reservations, user]);

  const isWithinReservationTime = () => {
    if (isWeekend) return false;
    const now = new Date();
    const start = set(now, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });
    const end = set(now, { hours: 22, minutes: 0, seconds: 0, milliseconds: 0 });
    return isWithinInterval(now, { start, end });
  };

  const handleReserve = async () => {
    if (!user || !selectedSeatId) return;

    if (isWeekend) {
      setError('주말(토, 일)은 스터디홀을 운영하지 않습니다.');
      return;
    }

    if (!isWithinReservationTime()) {
      setError('예약 가능 시간이 아닙니다. (12:00 - 22:00)');
      return;
    }

    if (myReservation) {
      setError('이미 내일의 예약을 완료하셨습니다.');
      return;
    }

    setIsReserving(true);
    setError(null);

    try {
      // Double check if seat is still available
      const q = query(
        collection(db, 'reservations'), 
        where('date', '==', tomorrowStr), 
        where('seatId', '==', selectedSeatId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setError('이미 예약된 테이블입니다.');
        setIsReserving(false);
        return;
      }

      await addDoc(collection(db, 'reservations'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        seatId: selectedSeatId,
        date: tomorrowStr,
        createdAt: serverTimestamp()
      });

      setSuccess('예약이 완료되었습니다!');
      setSelectedSeatId(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'reservations');
      setError('예약 중 오류가 발생했습니다.');
    } finally {
      setIsReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100"
        >
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">스터디홀 예약</h1>
          <p className="text-gray-500 mb-8">구글 계정으로 로그인하여 테이블을 예약하세요.</p>
          <button
            onClick={handleLogin}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-200"
          >
            <LogIn className="w-5 h-5" />
            Google로 로그인
          </button>
        </motion.div>
      </div>
    );
  }

  const reservationTime = isWithinReservationTime();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 hidden sm:inline">스터디홀 예약</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-sm font-medium text-gray-700">{user.displayName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="로그아웃"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Status & Info */}
        <div className="md:col-span-1 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              예약 정보
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">예약 대상 날짜</span>
                <span className="font-semibold text-gray-900">{tomorrowStr}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">예약 가능 시간</span>
                <span className="font-semibold text-blue-600">12:00 - 22:00</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 text-sm">현재 상태</span>
                {isWeekend ? (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    주말 휴무
                  </span>
                ) : reservationTime ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    예약 가능
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider">
                    시간 아님
                  </span>
                )}
              </div>
            </div>
          </section>

          <AnimatePresence mode="wait">
            {isWeekend ? (
              <motion.section 
                key="weekend"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-100 border border-gray-200 rounded-2xl p-6"
              >
                <h3 className="font-bold text-gray-900 mb-2">주말 휴무 안내</h3>
                <p className="text-gray-600 text-sm">토요일과 일요일은 스터디홀을 운영하지 않습니다. 월요일 예약은 일요일 12:00부터 가능합니다.</p>
              </motion.section>
            ) : myReservation ? (
              <motion.section 
                key="reserved"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900">예약 완료</h3>
                    <p className="text-green-700 text-sm">내일의 테이블이 확정되었습니다.</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-green-100">
                  <div className="text-xs text-gray-400 mb-1 uppercase tracking-widest font-bold">선택된 테이블</div>
                  <div className="text-3xl font-black text-green-600">{myReservation.seatId}번</div>
                </div>
              </motion.section>
            ) : (
              <motion.section 
                key="not-reserved"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
              >
                <h3 className="font-bold text-blue-900 mb-2">테이블을 선택하세요</h3>
                <p className="text-blue-700 text-sm mb-4">원하는 테이블을 클릭한 후 예약 버튼을 눌러주세요.</p>
                {selectedSeatId && (
                  <div className="bg-white rounded-xl p-4 border border-blue-100 mb-4">
                    <div className="text-xs text-gray-400 mb-1 uppercase tracking-widest font-bold">선택된 테이블</div>
                    <div className="text-3xl font-black text-blue-600">{selectedSeatId}번</div>
                  </div>
                )}
                <button
                  disabled={!selectedSeatId || !reservationTime || isReserving || isWeekend}
                  onClick={handleReserve}
                  className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    !selectedSeatId || !reservationTime || isReserving || isWeekend
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200'
                  }`}
                >
                  {isReserving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    '지금 예약하기'
                  )}
                </button>
              </motion.section>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </motion.div>
          )}
        </div>

        {/* Right Column: Seat Map */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900">테이블 배치도</h2>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                {reservations.length} / {TOTAL_TABLES} 예약됨
              </div>
            </div>
            
            <SeatMap 
              selectedSeatId={selectedSeatId}
              onSelectSeat={setSelectedSeatId}
              reservations={reservations}
            />

            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600">
              <p className="font-bold mb-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-gray-400" />
                이용 안내
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>예약은 매일 12:00부터 22:00까지만 가능합니다.</li>
                <li>다음 날의 테이블을 미리 예약하는 시스템입니다.</li>
                <li>토요일과 일요일은 스터디홀을 운영하지 않습니다.</li>
                <li>하루에 한 번만 예약할 수 있으며, 예약 후 테이블 변경은 불가능합니다.</li>
                <li>테이블 번호를 클릭하여 선택할 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
