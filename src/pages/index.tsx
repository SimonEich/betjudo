import { SignIn, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from "next/image";
import { api } from "~/utils/api";
import { RouterOutputs } from "~/utils/api";
import { LoadingPage} from "~/components/loading";
import { useState } from "react";
import { users } from "@clerk/nextjs/dist/api";






const CreatePostWizard = () => {
  dayjs.extend(relativeTime);
  
  const {user} = useUser();
  console.log(user);
  
  
  const [input, setInput] = useState("");
  
const ctx = api.useContext();


const {mutate, isLoading : isPosting} = api.posts.create.useMutation({
  onSuccess: () =>{
  setInput("")
  void ctx.posts.getAll.invalidate()
}
}
);



if (!user) return null;



return (<div >
  <Image className="rounded-full" src={user.profileImageUrl} width={56} height={56} alt="" />
  
  
  <div className="flex justify-between items-center mx-auto max-w-screen-xl p-4 bg-slate-200">
  <input
        placeholder="Content"
        className="grow bg-transparent outline-none"
        type="text"
        value= {input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
        />
 <button onClick={() => mutate({content : input})} >Post</button>
</div>
</div> 
);

};



type PostWithUser = RouterOutputs["posts"]["getAll"][number]

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  console.log(author);
  return (
    <div key={post.id} className="border-b border-slate-400 p-8">
              <Image className="h-14 w-14 rounded-full" src={author.profilePicture}   width={56} height={56} alt="" />
              {post.content}
              <span>  @{author?.username || author?.fullname}</span>
              <span> - {dayjs(post.createdAt).fromNow()}</span>
            </div>
  );

}
const Feed = () => {
  const {data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;
 

  if (!data) return <div>Something went wrong</div>


  return (
    <div className="flex grow flex-col overflow-y-scroll">
      {[...data].map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  )

}


const Home: NextPage = () => {
  
  const {data} = api.posts.getAll.useQuery();
  const { isLoaded: userLoaded, isSignedIn} = useUser();
  api.posts.getAll.useQuery();
  
  
  if (!userLoaded) return <div></div>;
  // 

  function setInput(value: string): void {
    throw new Error("SetInput mistake");
  }

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="">


        
<nav className=" bg-slate-200 dark:bg-gray-1200">
    <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4 bg-slate-200">
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">JudoBet</span>
                <div className="flex items-center">
            <a href="#" className="text-sm  text-blue-600 dark:text-blue-500 hover:underline">
              {!isSignedIn&&<SignInButton />}
              {!!isSignedIn&&<UserButton/>}
              <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
              </a>
        </div>
    </div>
</nav>
<nav className="bg-gray-100 dark:bg-gray-700">
    <div className="max-w-screen-xl px-4 py-3 mx-auto">
        <div className="flex items-center">
            <ul className="flex flex-row font-medium mt-0 mr-6 space-x-8 text-sm">
                <li>
                    <a href="#" className="text-gray-900 dark:text-white hover:underline" aria-current="page">Home</a>
                </li>
                <li>
                    <a href="#" className="text-gray-900 dark:text-white hover:underline">Tournaments</a>
                </li>
                <li>
                    <a href="#" className="text-gray-900 dark:text-white hover:underline">My Bets</a>
                </li>
                <li>
                    <a href="#" className="text-gray-900 dark:text-white hover:underline">Team</a>
                </li>
            </ul>
        </div>
    </div>
</nav>
<div className="m-5 flex justify-center border-x sc w-full md:max-w-200">
  <CreatePostWizard />
</div>

        
       
        <div>
          <Feed />
        <h1>hello World</h1>
        </div>
      </main>
    </>
  );
};  

export default Home;

//<div className="flex justify-between items-center mx-auto max-w-screen-xl p-4 bg-slate-20">
//{data?.map((post) =>(<p >{post.post.content}</p>
//))}
//</div>
