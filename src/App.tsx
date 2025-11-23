// 外部の関数・型定義ファイル
import './scss/App.scss'; // viteがコンパイル時にcssに自動で処理するので、importはscssでOK

// 読み込むコンポーネント
import NavigationBar from './components/NavigationBar';
import Loading from './components/Loading';

function App() {
  return (
    <>
      <NavigationBar />
      <div className='App'>
        <Loading />
        <button>次の20件</button>
      </div>
      ;
    </>
  );
}
export default App;
