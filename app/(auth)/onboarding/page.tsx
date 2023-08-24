import AkunProfil from "@/components/forms/AkunProfil"
import { currentUser } from "@clerk/nextjs"

async function Page() {
    const user = await currentUser()
    const userInfo = {}

    const userData = {
        id: user?.id,
        objectId: userInfo?._id,
        username: userInfo?.username || user?.username,
        name: userInfo?.name || user?.firstName || "",
        bio: userInfo?.bio || "",
        image: userInfo?.image || user?.imageUrl,
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
