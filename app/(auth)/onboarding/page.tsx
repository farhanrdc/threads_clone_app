import AkunProfil from "@/components/forms/AkunProfil"
import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";

async function Page() {
    const user = await currentUser()
    if (!user) return null; // to avoid typescript warnings

    const userInfo = await fetchUser(user.id);
    if (userInfo?.onboarded) redirect("/");

    const userData = {
        id: user?.id,
        objectId: userInfo?._id,
        username: userInfo ? userInfo?.username : user.username,
        name: userInfo ? userInfo?.name : user.firstName ?? "",
        bio: userInfo ? userInfo?.bio : "",
        image: userInfo ? userInfo?.image : user.imageUrl,
    }

    return(
        <main className="mx-auto flex flex-col max-w-3xl justify-start px-10 py-10">
            <h1 className="head-text">OnBoarding</h1>
            <p className="text-base-regular text-light-2 mt-3">Complete your profile now to use threads</p>
            <section className="bg-dark-2 p-10 mt-9">
                <AkunProfil user={userData} btnTitle="Continue"/>
            </section>
        </main>

    )
}

export default Page
