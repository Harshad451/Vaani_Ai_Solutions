/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AndroidFile } from './types';

export const androidSourceFiles: AndroidFile[] = [
  {
    path: "app/build.gradle.kts",
    name: "build.gradle.kts",
    language: "groovy",
    description: "App-level build specification containing dependencies for Retrofit, GSON, Jetpack Compose, and Kotlin Coroutines.",
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.vaaniai.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.vaaniai.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    
    // Compose UI
    implementation(platform("androidx.compose:compose-bom:2024.01.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Network & Serializers
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}
`
  },
  {
    path: "app/src/main/AndroidManifest.xml",
    name: "AndroidManifest.xml",
    language: "xml",
    description: "System manifest file establishing target network permission and declaring the primary full-screen chat entry point.",
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.vaaniai.app">

    <!-- Production Requirement for real-time cloud operations -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="VaaniAI Support"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Material3.Dark"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.Material3.Dark.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
  },
  {
    path: "app/src/main/java/com/vaaniai/app/MainActivity.kt",
    name: "MainActivity.kt",
    language: "kotlin",
    description: "Launch activities wrapper initializing the Jetpack Compose surface canvas in immersive full-height dark layouts.",
    content: `package com.vaaniai.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.vaaniai.app.ui.ChatScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    ChatScreen()
                }
            }
        }
    }
}
`
  },
  {
    path: "app/src/main/java/com/vaaniai/app/data/TicketModel.kt",
    name: "TicketModel.kt",
    language: "kotlin",
    description: "Data transport blueprints mapping the schema matching Express standard types and custom intent indices.",
    content: `package com.vaaniai.app.data

import com.google.gson.annotations.SerializedName

data class Message(
    @SerializedName("id") val id: String,
    @SerializedName("sender") val sender: String, // "CUSTOMER" | "AI" | "AGENT" | "SYSTEM"
    @SerializedName("content") val content: String,
    @SerializedName("createdAt") val createdAt: String,
    @SerializedName("intent") val intent: String?,
    @SerializedName("confidence") val confidence: Double?,
    @SerializedName("sentiment") val sentiment: String?,
    @SerializedName("detectedLanguage") val detectedLanguage: String?
)

data class Ticket(
    @SerializedName("id") val id: String,
    @SerializedName("customerName") val customerName: String,
    @SerializedName("phoneNumber") val phoneNumber: String,
    @SerializedName("status") val status: String, // "AI_PENDING" | "RESOLVED" | "ESCALATED"
    @SerializedName("detectedLanguage") val detectedLanguage: String?,
    @SerializedName("lastIntent") val lastIntent: String?,
    @SerializedName("sentiment") val sentiment: String,
    @SerializedName("createdAt") val createdAt: String,
    @SerializedName("updatedAt") val updatedAt: String,
    @SerializedName("messages") val messages: List<Message>
)

data class CustomerMessagePayload(
    @SerializedName("customerName") val customerName: String,
    @SerializedName("phoneNumber") val phoneNumber: String,
    @SerializedName("message") val message: String
)
`
  },
  {
    path: "app/src/main/java/com/vaaniai/app/data/VaaniApiService.kt",
    name: "VaaniApiService.kt",
    language: "kotlin",
    description: "Retrofit contract network definitions interacting directly with full-stack Node endpoint routers.",
    content: `package com.vaaniai.app.data

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.GET

interface VaaniApiService {
    @POST("/api/tickets")
    suspend fun sendMessage(
        @Body payload: CustomerMessagePayload
    ): Response<Ticket>

    @GET("/api/tickets/{id}")
    suspend fun getTicketDetails(
        @Path("id") ticketId: String
    ): Response<Ticket>
}
`
  },
  {
    path: "app/src/main/java/com/vaaniai/app/viewmodel/ChatViewModel.kt",
    name: "ChatViewModel.kt",
    language: "kotlin",
    description: "Main architectural component managing local state flows, networking calls, and fallback connection caches.",
    content: `package com.vaaniai.app.viewmodel

import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vaaniai.app.data.CustomerMessagePayload
import com.vaaniai.app.data.Message
import com.vaaniai.app.data.VaaniApiService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit

sealed class ChatUiState {
    object Idle : ChatUiState()
    object Sending : ChatUiState()
    data class Error(val message: String) : ChatUiState()
}

class ChatViewModel : ViewModel() {
    // OkHttp Client configured with generous response timeouts
    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl("https://vaaniai-api.onrender.com") // Target host address or sandbox proxy ingress URL
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    private val apiService = retrofit.create(VaaniApiService::class.java)

    // Identity configurations
    val customerName = "Aarav Mehta"
    val phoneNumber = "+919812345678"

    private val _uiState = MutableStateFlow<ChatUiState>(ChatUiState.Idle)
    val uiState: StateFlow<ChatUiState> = _uiState

    val messages = mutableStateListOf<Message>()
    val inputBuffer = mutableStateOf("")

    fun sendMessage() {
        val rawMessage = inputBuffer.value.trim()
        if (rawMessage.isEmpty()) return

        inputBuffer.value = ""
        _uiState.value = ChatUiState.Sending

        viewModelScope.launch {
            try {
                val payload = CustomerMessagePayload(
                    customerName = customerName,
                    phoneNumber = phoneNumber,
                    message = rawMessage
                )
                val response = apiService.sendMessage(payload)

                if (response.isSuccessful && response.body() != null) {
                    val ticket = response.body()!!
                    messages.clear()
                    messages.addAll(ticket.messages)
                    _uiState.value = ChatUiState.Idle
                } else {
                    _uiState.value = ChatUiState.Error("Server responded with code: \${response.code()}")
                }
            } catch (e: Exception) {
                _uiState.value = ChatUiState.Error("Network error: \${e.localizedMessage}")
            }
        }
    }
}
`
  },
  {
    path: "app/src/main/java/com/vaaniai/app/ui/ChatScreen.kt",
    name: "ChatScreen.kt",
    language: "kotlin",
    description: "High-fidelity Jetpack Compose styling rendering message bubbles, state indicator lights, and immersive dark inputs.",
    content: `package com.vaaniai.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.vaaniai.app.viewmodel.ChatUiState
import com.vaaniai.app.viewmodel.ChatViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(viewModel: ChatViewModel = viewModel()) {
    val messages = viewModel.messages
    val currentInput = viewModel.inputBuffer
    val uiState by viewModel.uiState.collectAsState()
    val scrollState = rememberLazyListState()

    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            scrollState.animateScrollToItem(messages.size - 1)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "NoshBerry Support Engine",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFF1EDE6)
                        )
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .background(Color(0xFFff7c2a), RoundedCornerShape(3.dp))
                            )
                            Spacer(modifier = Modifier.width(5.dp))
                            Text(
                                text = "VaaniAI Multilingual Smart Routing",
                                fontSize = 11.sp,
                                color = Color(0xFFA19FA8)
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF13151A)
                )
            )
        },
        bottomBar = {
            Surface(
                color = Color(0xFF13151A),
                modifier = Modifier.navigationBarsPadding()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = currentInput.value,
                        onValueChange = { currentInput.value = it },
                        placeholder = { Text("Mera coupon nahi laga... / Ask support...", color = Color(0xFF7A7885)) },
                        colors = TextFieldDefaults.outlinedTextFieldColors(
                            textColor = Color(0xFFF1EDE6),
                            focusedBorderColor = Color(0xFFFF7C2A),
                            unfocusedBorderColor = Color(0xFF1D212A),
                            containerColor = Color(0xFF1D212A)
                        ),
                        modifier = Modifier.weight(1.0f),
                        maxLines = 4,
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                        keyboardActions = KeyboardActions(onSend = { viewModel.sendMessage() })
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    IconButton(
                        onClick = { viewModel.sendMessage() },
                        colors = IconButtonDefaults.iconButtonColors(
                            containerColor = Color(0xFFFF7C2A)
                        ),
                        modifier = Modifier.size(52.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Send,
                            contentDescription = "Send",
                            tint = Color.White
                        )
                    }
                }
            }
        },
        containerColor = Color(0xFF0F1014)
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            if (messages.isEmpty()) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "No messages yet",
                        color = Color(0xFF7A7885),
                        fontWeight = FontWeight.Medium,
                        fontSize = 15.sp
                    )
                    Text(
                        text = "Send a message in your language (e.g. Hindi, Tamil, Hinglish)",
                        color = Color(0xFF5A5865),
                        fontSize = 12.sp,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            } else {
                LazyColumn(
                    state = scrollState,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(messages) { msg ->
                        val isUser = msg.sender == "CUSTOMER"
                        val containerBg = if (isUser) Color(0xFFFF7C2A) else Color(0xFF1D212A)
                        val textColor = if (isUser) Color.White else Color(0xFFF1EDE6)
                        val alignStyle = if (isUser) Alignment.End else Alignment.Start
                        val cornerLayout = if (isUser) {
                            RoundedCornerShape(14.dp, 14.dp, 0.dp, 14.dp)
                        } else {
                            RoundedCornerShape(14.dp, 14.dp, 14.dp, 0.dp)
                        }

                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalAlignment = alignStyle
                        ) {
                            Surface(
                                color = containerBg,
                                shape = cornerLayout,
                                modifier = Modifier.widthIn(max = 300.dp)
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    if (!isUser) {
                                        Text(
                                            text = msg.sender,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 9.sp,
                                            color = Color(0xFFFF7C2A),
                                            modifier = Modifier.padding(bottom = 3.dp)
                                        )
                                    }
                                    Text(
                                        text = msg.content,
                                        color = textColor,
                                        fontSize = 14.sp,
                                        lineHeight = 19.sp
                                    )
                                }
                            }
                            Text(
                                text = msg.createdAt,
                                fontSize = 9.sp,
                                color = Color(0xFF5A5865),
                                modifier = Modifier.padding(top = 4.dp, start = 4.dp, end = 4.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
`
  }
];
