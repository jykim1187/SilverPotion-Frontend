<template>
    <v-container class="text-center">
        <v-row justify="center" align="center" class="mt-8">
            <v-col cols="12" sm="5" md="4">
                <v-btn
                    block
                    color="primary"
                    size="large"
                    to="/silverpotion/healthdatapage"
                >
                    건강
                </v-btn>
            </v-col>
            
            <v-col cols="12" sm="5" md="4">
                <v-btn
                    block
                    color="secondary"
                    size="large"
                    to="/silverpotion/gathering/main"
                >
                    모임
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default{
    data(){
        return {
            
        }
    },
}
</script>